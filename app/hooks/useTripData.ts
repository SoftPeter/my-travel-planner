import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { auth, database } from '../lib/firebase';
import { Trip } from '../types';
import { getTrip, saveTrip } from '../utils/localStorage';
import { App } from 'antd';

export function useTripData(tripId: string) {
    const { message } = App.useApp();
    const [trip, setLocalTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // 디바운스 타이머 참조
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 1. 익명 로그인 처리
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                signInAnonymously(auth).catch((error) => {
                    console.error("Auth Error:", error);
                    message.error("인증 서버에 연결할 수 없습니다.");
                });
            }
        });
        return () => unsubscribe();
    }, [message]);

    // 2. 데이터 동기화 및 마이그레이션
    useEffect(() => {
        if (!user || !tripId) return;

        setLoading(true);
        const tripRef = ref(database, `trips/${tripId}`);

        const unsubscribe = onValue(tripRef, (snapshot) => {
            const data = snapshot.val() as Trip | null;

            if (data) {
                // 데이터 정규화: Firebase 특성상 빈 배열이 누락될 수 있으므로 기본값 강제 할당
                const normalizedData: Trip = {
                    ...data,
                    days: (data.days || []).map(day => ({
                        ...day,
                        places: day.places || [],
                        travelModes: day.travelModes || [],
                    }))
                };

                setLocalTrip(normalizedData);
                saveTrip(normalizedData);
            } else {
                // DB에 데이터가 없음 -> 로컬 스토리지 확인 (마이그레이션)
                const localData = getTrip(tripId);
                if (localData) {
                    console.log("Migrating local data to Firebase...");
                    set(tripRef, localData); // 로컬 데이터를 DB로 업로드
                    setLocalTrip(localData);
                } else {
                    // DB에도 없고 로컬에도 없음 -> 신규 생성 필요 (Component에서 처리)
                    // 여기서는 null 상태 유지
                    setLocalTrip(null);
                }
            }
            setLoading(false);
        }, (error) => {
            console.error("DB Error:", error);
            message.error("데이터를 불러오는데 실패했습니다.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, tripId, message]);

    // 3. 데이터 저장 (디바운스 적용)
    const setTrip = useCallback((newTrip: Trip) => {
        // 낙관적 업데이트 (로컬 상태 즉시 반영)
        setLocalTrip(newTrip);
        setIsSaving(true);

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }

        saveTimerRef.current = setTimeout(() => {
            if (!user || !tripId) return;

            // currentDayId는 공유 데이터에서 제외 (각자의 로컬 상태 유지)
            const { currentDayId, ...tripToSave } = newTrip;

            const tripRef = ref(database, `trips/${tripId}`);
            set(tripRef, tripToSave)
                .then(() => {
                    setIsSaving(false);
                })
                .catch((err) => {
                    console.error("Save failed:", err);
                    message.error("저장에 실패했습니다.");
                    setIsSaving(false);
                });
        }, 1000); // 1초 디바운스
    }, [user, tripId, message]);

    return { trip, setTrip, loading, isSaving };
}
