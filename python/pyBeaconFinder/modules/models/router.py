from modules.config.constants import Constants


class Router:
    def __init__(
        self,
        router_id: str,
        name: str,
        tx_power: float,
        location: tuple[int, int],
        status: bool,
        last_seen: int,
    ):
        self.router_id = router_id
        self.name = name
        self.tx_power = tx_power
        self.loss = Constants.DEFAULT_LOSS
        self.location = location
        self.status = status
        self.last_seen = last_seen

    def __repr__(self):
        return (
            "<Router(id='%s', name='%s', location='%s', status='%s', last_seen='%s')>"
            % (self.router_id, self.name, self.location, self.status, self.last_seen)
        )
