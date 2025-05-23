from modules.controllers.fileloader import FileLoader
from modules.models.signal import Signal
from modules.controllers.createsignals import create_signals_from_file
from modules.models.router import Router
from modules.config.routerinfo import RouterInfo
from modules.controllers.createbeacons import create_beacons_from_file
from modules.models.beacon import Beacon
from modules.controllers.trilaterate import trilaterate_beacon_at_timestamp
from modules.controllers.plotter import plot_beacon, plot_beacon_list, plot_router_arcs

if __name__ == "__main__":
    test = FileLoader("data/130324010001.json")

    signal_list: list[Signal] = create_signals_from_file(test)
    router_list: list[Router] = RouterInfo.router_list
    beacon_list: list[Beacon] = create_beacons_from_file(test)

    for beacon in beacon_list:
        beacon.populate_signals(signal_list)
        beacon.calculate_last_seen()

    for beacon in beacon_list:
        beacon.assign_names()
        for signal in signal_list:
            for router in router_list:
                if signal.router_id == router.router_id:
                    signal.calculate_distance(router.tx_power, router.loss)

    for beacon in beacon_list:
        print(beacon.name)
        for signal in beacon.signal_records:
            print(signal.signal_timestamp, signal.router_id, signal.calculated_distance)
        beacon.last_location = trilaterate_beacon_at_timestamp(beacon, 1710334801, 20)
        print(f"Location: {beacon.last_location}")
        print("--------------------------------------")
        print(" ")

    for beacon in beacon_list:
        plot_router_arcs(beacon, 1710334801, 20)

    plot_beacon_list(beacon_list)

    print("Done")
