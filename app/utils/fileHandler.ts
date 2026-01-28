import { Trip } from '../types';
import { saveTrip } from './localStorage';

/**
 * 여행 데이터를 JSON 파일로 내보내기 (다운로드)
 */
export const exportTripToFile = (trip: Trip) => {
    const fileName = `${trip.tripName.replace(/\s+/g, '_')}_${trip.startDate}.json`;
    const jsonStr = JSON.stringify(trip, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

/**
 * JSON 파일을 읽어서 여행 데이터로 변환 및 저장
 */
export const importTripFromFile = (file: File): Promise<Trip> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                // 간단한 유효성 검사
                if (!json.id || !json.days) {
                    throw new Error('유효하지 않은 여행 데이터 파일입니다.');
                }

                // 가져온 데이터 ID 충돌 방지를 위해 새 ID 부여 (선택 사항, 여기선 그대로 유지하거나 새로 딸 수 있음)
                // 여기서는 안전하게 새 ID를 부여하는 방식으로 구현 (복제본 생성 개념)
                const importedTrip: Trip = {
                    ...json,
                    id: `imported-${Date.now()}`,
                    tripName: `${json.tripName} (가져옴)`
                };

                saveTrip(importedTrip);
                resolve(importedTrip);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsText(file);
    });
};
