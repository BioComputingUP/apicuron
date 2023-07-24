from pymongo import MongoClient


class Database:


    client = None
    dbnames = []
    apicuron_db = None


    @classmethod
    def connect_db(cls,hostname: str, database: str, port=27017):
        cls.client = MongoClient(hostname, port)
        cls.dbnames = cls.client.list_database_names()
        if database in cls.dbnames:
            
            cls.apicuron_db = cls.client[database]
            return cls.client[database]
        else:
            raise Exception(f'Database Not found: Database "{database}" not found in {hostname}:{port}')

    @classmethod
    def get_db(cls, database: str):
        if cls.client is None:
            raise Exception('Client not ready yet')
        if database not in cls.dbnames:
            raise Exception(f'Database Not found: Database "{database}" not found in {cls.client.address}')
        return cls.client[database]

    @classmethod
    def close_connection(cls):
        cls.client
        if cls.client is not None:
            cls.client.close()