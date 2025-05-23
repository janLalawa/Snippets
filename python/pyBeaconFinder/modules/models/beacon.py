from modules.models.signal import Signal
from modules.config.beaconinfo import BeaconInfo


class Beacon:
    def __init__(
        self,
        beacon_id: str,
        status: bool,
        last_seen: int,
    ):
        self.beacon_id = beacon_id
        self.name = None
        self.signal_records = []
        self.last_location = (0, 0)
        self.status = status
        self.last_seen = last_seen

    def __repr__(self):
        return (
            "<Beacon(id='%s', name='%s', signal_count ='%s', location='%s', status='%s', last_seen='%s')>"
            % (
                self.beacon_id,
                self.name,
                len(self.signal_records),
                self.last_location,
                self.status,
                self.last_seen,
            )
        )

    def populate_signals(self, signals: list[Signal]):
        for signal in signals:
            if signal.beacon_id == self.beacon_id:
                self.signal_records.append(signal)

    def calculate_last_seen(self):
        self.last_seen = max(
            [signal.signal_timestamp for signal in self.signal_records]
        )

    def assign_names(self):
        beacon_owners: dict[str, str] = BeaconInfo.beacon_owners
        self.name = beacon_owners.get(self.beacon_id, "No Name")
        return self.name
