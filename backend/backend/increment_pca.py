import math
import numpy as np
from sklearn.decomposition import PCA
# from inc_pca import IncPCA

# IPca = IncPCA(2, 1)
np.random.seed(7)

def incremental_pca_test(dataset):
    """ Just for test
    """
    time = []
    for i, data in enumerate(dataset):
        for t in data['delay']['time']:
            time.append([i, t])
    num = len(time)
    time.sort(key=lambda v: v[1])
    data = np.zeros((num, len(dataset[0]['online']['weight'][0])))
    for i, v in enumerate(time):
        index = len(dataset[v[0]]['online']['index'])
        data[i] = dataset[v[0]]['online']['weight'][index]
        dataset[v[0]]['online']['index'].append(i)

    shape = data.shape
    pca = PCA(n_components=2)
    positions = pca.fit_transform(data)
    min_v = [positions[:, 0].min(), positions[:, 1].min()]
    max_v = [positions[:, 0].max(), positions[:, 1].max()]
    for i in range(len(dataset)):
        dataset[i]['online']['position'] = positions[dataset[i]['online']['index']].tolist()
    return {'min': {'x': min_v[0], 'y': min_v[1]}, 'max': {'x': max_v[0], 'y': max_v[1]}}


def incremental_pca(dataset):
    """ Apply Incremental Pca
    """
    time = []
    for i, data in enumerate(dataset):
        for t in data['time']:
            time.append([i, t])
    num = len(time)
    time.sort(key=lambda v: v[1])
    data = np.zeros((num, dataset[0]['weight'].shape[1]))
    for i, v in enumerate(time):
        index = len(dataset[v[0]]['index'])
        data[i] = dataset[v[0]]['weight'][index]
        dataset[v[0]]['index'].append(i)

    IPca.partial_fit(data)
    positions = IPca.transform(data)
    min_v = [positions[:, 0].min(), positions[:, 1].min()]
    max_v = [positions[:, 0].max(), positions[:, 1].max()]
    for i in range(len(dataset)):
        dataset[i]['position'] = positions[dataset[i]['index']].tolist()
    return min_v, max_v
