import { useEffect, useState } from 'react';

import { Position } from '.';

export function useLoadQQMap() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let abort = false;
        const funName = `qqMapCallback` + uniqId();
        (window as any)[funName] = () => {
            if (abort) {
                return;
            }
            setLoaded(true);
        };
        //创建script标签
        const script = document.createElement('script');
        //设置标签的type属性
        script.type = 'text/javascript';
        //设置标签的链接地址
        script.src = `https://map.qq.com/api/js?v=2.exp&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&callback=${funName}`;
        //添加标签到dom
        document.body.appendChild(script);
        return () => {
            abort = true;
        };
    }, []);

    return loaded;
}

function uniqId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatPosition(position: Position): Position {
    return {
        lat: Number(position.lat).toFixed(6),
        lng: Number(position.lng).toFixed(6),
    };
}
