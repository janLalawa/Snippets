import json


class FileLoader:
    def __init__(self, path: str):
        self.path = path
        self.file_name = path.split("/")[-1].split(".")[0]
        self.data = self.load()

    def load(self):
        with open(self.path, "r") as file:
            return json.load(file)
