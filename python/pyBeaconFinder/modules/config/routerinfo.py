from modules.models.router import Router
from modules.config.constants import Constants


class RouterInfo:
    router_list: list[Router] = [
        Router(
            router_id="AC233FC16FC7",
            name="Alice",
            tx_power=Constants.DEFAULT_TX_POWER,
            location=(0, 0),
            status=True,
            last_seen=0,
        ),
        Router(
            router_id="AC233FC16FC4",
            name="Bob",
            tx_power=Constants.DEFAULT_TX_POWER,
            location=(-20, 15),
            status=True,
            last_seen=0,
        ),
        Router(
            router_id="AC233FC16FC9",
            name="James",
            tx_power=Constants.DEFAULT_TX_POWER,
            location=(-2, 18),
            status=True,
            last_seen=0,
        ),
    ]
