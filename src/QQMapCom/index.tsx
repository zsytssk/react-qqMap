import {
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { formatPosition, useLoadQQMap } from './utils';

import styles from './index.module.less';

export type Position = {
    lat: string;
    lng: string;
};
type Props = {
    optRef: React.MutableRefObject<
        (pos: Position) => Promise<Position | undefined>
    >;
};
export default function QQMapCom({ optRef }: Props) {
    const [position, setPosition] = useState<Position>();
    const [address, setAddress] = useState<string>();
    const ref = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>();
    const markerRef = useRef<any>();
    const geocoderRef = useRef<any>();
    const loaded = useLoadQQMap();
    const resolveRef = useRef<(pos: Position | undefined) => void>();

    useImperativeHandle(optRef, () => {
        return (pos) => {
            return new Promise((resolve, reject) => {
                setPosition(pos);
                resolveRef.current = resolve;
            });
        };
    });

    const initMapRef = useRef(false);
    useLayoutEffect(() => {
        if (!loaded || initMapRef.current) {
            return;
        }
        initMapRef.current = true;
        const map = new qq.maps.Map(ref.current, {
            zoom: 30,
            mapTypeId: qq.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                mapTypeIds: [qq.maps.MapTypeId.ROADMAP],
            },
            zoomControlOptions: {
                position: qq.maps.ControlPosition.LEFT_BOTTOM,
                style: qq.maps.ZoomControlStyle.SMALL,
            },
            panControlOptions: {
                //设置平移控件的位置为相对右方中间位置对齐.
                position: qq.maps.ControlPosition.LEFT_BOTTOM,
            },
        });
        qq.maps.event.addListener(map, 'click', (e: any) => {
            const pos = formatPosition({
                lat: e.latLng.lat,
                lng: e.latLng.lng,
            });
            setPosition(pos);
        });
        const geocoder = new qq.maps.Geocoder();
        const marker = new qq.maps.Marker({
            map: map,
        });
        geocoder.setComplete((result: any) => {
            map.setCenter(result.detail.location);
            const pos = formatPosition({
                lat: result.detail.location.lat,
                lng: result.detail.location.lng,
            });
            setPosition(pos);
        });
        //若服务请求失败，则运行以下函数
        geocoder.setError(() => {
            alert('找不到目标地址，请输入更详细的地址！');
        });
        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = geocoder;
    }, [loaded]);

    const initMapPosRef = useRef(false);
    useEffect(() => {
        if (!mapRef.current || !markerRef.current || !position) {
            return;
        }
        const latLng = new qq.maps.LatLng(position.lat, position.lng);
        if (!initMapPosRef.current) {
            initMapPosRef.current = true;
            mapRef.current.setCenter(latLng);
        }
        markerRef.current.setPosition(latLng);
    }, [loaded, position]);

    const resetFn = useCallback(() => {
        setPosition(undefined);
        initMapPosRef.current = false;
    }, []);

    const onConfirm = useCallback(
        (pos?: Position) => {
            resetFn();
            resolveRef.current?.(pos);
        },
        [resetFn],
    );

    const positionStr = useMemo(() => {
        if (!position) {
            return;
        }
        return `${position.lat},${position.lng}`;
    }, [position]);

    return (
        <div className={styles.wrap}>
            <div className="optBox">
                <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                    }}
                />
                <button
                    onClick={() => {
                        geocoderRef.current?.getLocation(address);
                    }}
                >
                    搜索
                </button>
                <input type="text" value={positionStr} />
                <button
                    onClick={() => {
                        onConfirm(position);
                    }}
                >
                    确定
                </button>
            </div>
            <div ref={ref} style={{ width: 500, height: 500 }} />;
        </div>
    );
}
