from modules.models.beacon import Beacon
from modules.models.router import Router
from modules.models.signal import Signal
from modules.config.routerinfo import RouterInfo


def trilaterate_beacon_at_timestamp(
    beacon: Beacon, timestamp: int, period: int
) -> tuple[float, float]:

    signal_list = beacon.signal_records
    signal_ping = create_signal_ping(signal_list, timestamp, period)

    if len(signal_ping) < 3:
        return None

    router1 = get_router_location(signal_ping[0].router_id)
    router2 = get_router_location(signal_ping[1].router_id)
    router3 = get_router_location(signal_ping[2].router_id)

    distance1 = signal_ping[0].calculated_distance
    distance2 = signal_ping[1].calculated_distance
    distance3 = signal_ping[2].calculated_distance

    x1, y1 = router1
    x2, y2 = router2
    x3, y3 = router3

    A = 2 * x2 - 2 * x1
    B = 2 * y2 - 2 * y1
    C = distance1**2 - distance2**2 - x1**2 + x2**2 - y1**2 + y2**2
    D = 2 * x3 - 2 * x2
    E = 2 * y3 - 2 * y2
    F = distance2**2 - distance3**2 - x2**2 + x3**2 - y2**2 + y3**2
    x = (C * E - F * B) / (E * A - B * D)
    y = (C * D - A * F) / (B * D - A * E)
    return x, y


def create_signal_ping(
    signal_list: list[Signal], timestamp: int, period: int
) -> list[Signal]:

    signal_ping = []
    start_period = timestamp - period

    for signal in signal_list:
        if start_period <= signal.signal_timestamp <= timestamp:
            signal_ping.append(signal)
    return signal_ping


def get_router_location(router_id: str) -> tuple[float, float]:
    for router in RouterInfo.router_list:
        if router.router_id == router_id:
            return router.location
