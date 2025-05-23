from modules.models.signal import Signal
from modules.models.beacon import Beacon
from modules.models.router import Router
from modules.controllers.fileloader import FileLoader
from modules.config.constants import Constants
from modules.helpers.timestamps import last_seen_to_unix_timestamp


def create_signals_from_file(file_loader: FileLoader) -> list[Signal]:
    signals_list: list[Signal] = []
    for signal in file_loader.data:

        signal_timestring = signal.get("LastSeen", "N/A")
        if signal_timestring != "N/A":
            temp_timestamp = last_seen_to_unix_timestamp(signal_timestring)
        else:
            temp_timestamp = Constants.DEFAULT_TIMESTAMP

        signals_list.append(
            Signal(
                signal_id=file_loader.file_name,
                router_id=signal.get("RouterId", "N/A"),
                beacon_id=signal.get("BeaconId", "N/A"),
                signal_strength=signal.get("SignalStrength", Constants.LOW_SIGNAL),
                signal_timestamp=temp_timestamp,
            )
        )
    return signals_list
