"use client";

import { APIProvider } from '@vis.gl/react-google-maps';
import { App, ConfigProvider } from 'antd';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </APIProvider>
    );
}
