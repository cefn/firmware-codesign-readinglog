import zorba_api
store = zorba_api.InMemoryStore_getInstance()
zorba = zorba_api.Zorba_getInstance(store)

with open('report.xq', 'r') as xquery:
    print zorba.compileQuery(xquery.read()).execute()
