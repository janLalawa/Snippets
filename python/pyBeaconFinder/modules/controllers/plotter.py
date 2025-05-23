from modules.models.beacon import Beacon
from matplotlib import pyplot as plt
from matplotlib.patches import Circle
from modules.config.routerinfo import RouterInfo
from modules.controllers.trilaterate import get_router_location, create_signal_ping


def plot_beacon(beacon: Beacon):
    x, y = beacon.last_location
    plt.plot(x, y, label=beacon.name)
    plt.xlabel("x-distance")
    plt.ylabel("y-distance")
    plt.legend()
    plt.show()


def plot_beacon_list(beacon_list):
    for beacon in beacon_list:
        if beacon.last_location is not None:
            x, y = beacon.last_location
            plt.plot(x, y, "o", markersize=8, label=beacon.name)

    for router in RouterInfo.router_list:
        x, y = router.location
        plt.plot(x, y, "x", markersize=8, label=router.router_id)
    plt.xlabel("x-distance")
    plt.ylabel("y-distance")
    plt.legend()
    plt.show()


def plot_router_arcs(beacon: Beacon, timestamp: int, period: int):
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

    plt.plot(x1, y1, "x", markersize=8, label=signal_ping[0].router_id)
    plt.plot(x2, y2, "x", markersize=8, label=signal_ping[1].router_id)
    plt.plot(x3, y3, "x", markersize=8, label=signal_ping[2].router_id)

    circle1 = Circle(
        (x1, y1),
        distance1,
        color="r",
        fill=False,
        label=f"{signal_ping[0].router_id} distance",
    )
    circle2 = Circle(
        (x2, y2),
        distance2,
        color="g",
        fill=False,
        label=f"{signal_ping[1].router_id} distance",
    )
    circle3 = Circle(
        (x3, y3),
        distance3,
        color="b",
        fill=False,
        label=f"{signal_ping[2].router_id} distance",
    )

    ax = plt.gca()
    ax.add_artist(circle1)
    ax.add_artist(circle2)
    ax.add_artist(circle3)

    all_x = [x1, x2, x3]
    all_y = [y1, y2, y3]
    min_x, max_x = min(all_x) - max(distance1, distance2, distance3), max(all_x) + max(
        distance1, distance2, distance3
    )
    min_y, max_y = min(all_y) - max(distance1, distance2, distance3), max(all_y) + max(
        distance1, distance2, distance3
    )
    plt.xlim(min_x, max_x)
    plt.ylim(min_y, max_y)

    plt.xlabel("x-distance")
    plt.ylabel("y-distance")
    plt.legend()
    plt.show()
