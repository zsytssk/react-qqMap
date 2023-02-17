import { useEffect, useRef } from 'react';
import QQMapCom, { Position } from './QQMapCom';

export default function App() {
    const optRef = useRef<(pos: Position) => Promise<Position | undefined>>();
    useEffect(() => {
        optRef.current?.({ lat: 31.172662, lng: 121.394084 }).then((pos) => {
            if (pos) {
                alert(`pos:lat:${pos.lat},lng:${pos.lng}`);
            }
        });
    }, []);

    return (
        <div>
            <QQMapCom optRef={optRef} />
        </div>
    );
}
