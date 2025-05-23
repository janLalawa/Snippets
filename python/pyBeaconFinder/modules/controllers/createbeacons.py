from modules.models.signal import Signal
from modules.models.beacon import Beacon
from modules.controllers.fileloader import FileLoader


def create_beacons_from_file(file_loader: FileLoader) -> list[Beacon]:
    beacons_list: list[Beacon] = []
    for beacon in file_loader.data:
        beacon_id = beacon.get("BeaconId", "N/A")

        if beacon_id != "N/A":
            if not check_beacon_existence(beacon_id, beacons_list):
                beacons_list.append(
                    Beacon(
                        beacon_id=beacon_id,
                        status=True,
                        last_seen=0,
                    )
                )

    return beacons_list


def check_beacon_existence(beacon_id: str, beacons_list: list[Beacon]) -> bool:
    for beacon in beacons_list:
        if beacon_id == beacon.beacon_id:
            return True
    return False
