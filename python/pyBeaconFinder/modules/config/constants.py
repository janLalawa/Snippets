class Paths:
    LOG_PATH = "./application.log"


class Constants:
    # A low signal strength to default to
    LOW_SIGNAL = -120.0

    # The default timestamp of a signal
    DEFAULT_TIMESTAMP = 0

    # The default signal loss of a router. 2 = OATS, 3 = General, 4 = Building, 5 = Dense Building
    DEFAULT_LOSS = 4.0

    # The default transmission power of a router
    DEFAULT_TX_POWER = -20.0

    # The seconds of allowable time difference between signals to class as a ping
    DEFAULT_PERIOD = 15
