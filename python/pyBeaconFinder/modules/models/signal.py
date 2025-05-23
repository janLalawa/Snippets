class Signal:
    def __init__(
        self,
        signal_id: int,
        router_id: str,
        beacon_id: str,
        signal_strength: float,
        signal_timestamp: int,
    ):
        self.signal_id: int = signal_id
        self.router_id: str = router_id
        self.beacon_id: str = beacon_id
        self.signal_strength: float = signal_strength
        self.signal_timestamp: int = signal_timestamp
        self.calculated_distance: float | None = None

    def __repr__(self):
        return (
            "<Signal(signal_id='%s', router_id='%s', beacon_id='%s' signal_strength='%s', signal_timestamp='%s', "
            "calculated_distance='%s')>"
            % (
                self.signal_id,
                self.router_id,
                self.beacon_id,
                self.signal_strength,
                self.signal_timestamp,
                self.calculated_distance,
            )
        )

    def calculate_distance(self, tx_power: float, loss: float) -> float:
        self.calculated_distance = 10 ** (
            (tx_power - self.signal_strength) / (10 * loss)
        )
        return self.calculated_distance
