import json
import os
import numpy as np
from .utils import random_warning, random_data, read_json_file
from .increment_pca import incremental_pca, incremental_pca_test


DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend/static/',
)
def read_dataset(data_name, path, dataset_name, filterNum=100):
    res = {
        'dataset': [],
        'configure': read_json_file(DATA_DIR + '{}/configure.json'.format(path))
    }
    res['configure']['dataSourceName'] = data_name
    res['configure']['datasetName'] = dataset_name
    res['configure']['attribute'] = read_json_file(DATA_DIR + '{}/attribute_config.json'.format(path))
    res['configure']['attribute']['filterNum'] = filterNum
    res['configure']['attribute']['correlation'] = []
    res['configure']['warningLevelMax'] = 5
    res['configure']['recordNum'] = []
    all_correlation = [0 for v in res['configure']['attribute']['name']]
    for name in data_name:
        dataset = read_json_file(DATA_DIR + '{}/{}/{}.json'.format(path, name, name))
        dataset['attribute'] = {
            'positive': np.load(DATA_DIR+ '{}/{}/positive_attribute.npy'.format(path, name)),
            'negative': np.load(DATA_DIR+ '{}/{}/negative_attribute.npy'.format(path, name)),
        }
        dataset['delay']['nb_prob'] = [0, 0] + dataset['delay']['nb_prob']
        res['configure']['recordNum'].append(sum(dataset['online']['dataNum']))
        num = len(dataset['delay']['time'])
        if (num == 2):
            begin_time = dataset['delay']['time'][0]
            num = len(dataset['delay']['accuracy'])
            dataset['delay']['time'] = [begin_time + i * res['configure']['timeUnit'] for i in range(num)]
        dataset['online']['index'] = []
        # dataset['delay']['hit'] = np.random.randint(2, size=num).tolist()

        # set state and pmin
        dataset['delay']['state'] = np.zeros(num)
        dataset['delay']['pmin'] = dataset['delay']['accuracy'].copy()
        timeStart = res['configure']['timeStart']
        timeUnit = res['configure']['timeUnit']
        for v in dataset['delay']['warning']:
            start_time = int((v['start'] - timeStart) / timeUnit)
            end_time = int((v['end'] - timeStart) / timeUnit) + 1
            for off in range(start_time, end_time):
                dataset['delay']['state'][off] = dataset['delay']['warningLevel'][off]['max']

            for pmin_index, time in enumerate(v['max_accuracy_time']):
                pmin_time = int((time - timeStart) / timeUnit)
                dataset['delay']['pmin'][pmin_time] = \
                    max(dataset['delay']['pmin'][pmin_time], v['max_accuracy'][pmin_index])
                dataset['delay']['accuracy'][pmin_time] = \
                    min(dataset['delay']['accuracy'][pmin_time], v['backend_accuracy'][pmin_index])
        for v in dataset['delay']['drift']:
            start_time = int((v['start'] - timeStart) / timeUnit)
            end_time = int((v['end'] - timeStart) / timeUnit) + 1
            for off in range(start_time, end_time):
                dataset['delay']['state'][off] = max(dataset['delay']['state'][off], dataset['delay']['warningLevel'][off]['max'])

            for pmin_index, time in enumerate(v['max_accuracy_time']):
                pmin_time = int((time - timeStart) / timeUnit)
                dataset['delay']['pmin'][pmin_time] = \
                    max(dataset['delay']['pmin'][pmin_time], v['max_accuracy'][pmin_index])
                dataset['delay']['accuracy'][pmin_time] = \
                    min(dataset['delay']['accuracy'][pmin_time], v['backend_accuracy'][pmin_index])
        # reset attributes
        attributes = []
        dataNum = dataset['online']['dataNum']
        cnt = 0
        for attr_index, attr in enumerate(dataset['delay']['attributes']):
            if attr['num'] > 1:
                predict = np.array(attr['predict'])
                correlation = np.array(attr['correlation'])
                for i in range(attr['num']):
                    attributes.append({
                        'name': attr['name'] + '-{}'.format(i),
                        'predict': predict[:, i].tolist(),
                        'correlation': correlation[:, i].tolist()
                    })
                    all_correlation[cnt] += sum([dataNum[ii] * predict[ii, i] for ii in range(len(dataNum))])
                    cnt += 1
            else:
                attributes.append({
                    'name': attr['name'],
                    'predict': attr['predict'],
                    'correlation': attr['correlation']
                })
                all_correlation[cnt] += sum([dataNum[ii] * attr['predict'][ii] for ii in range(len(dataNum))])
                cnt += 1
        dataset['delay']['attributes'] = attributes
        res['dataset'].append(dataset)

    all_records = sum(res['configure']['recordNum'])
    res['configure']['attribute']['correlation'] = [v / all_records for v in all_correlation]
    # set pca
    res['configure']['pca'] = incremental_pca_test(res['dataset'])

    return res


PRSA_DATA_NAME = ['Guanyuan', 'Tiantan', 'Wanshouxigong', 'Dongsi']
PRSA_DATASET = read_dataset(PRSA_DATA_NAME, 'prsa_data', 'prsa', 12)
# PRSA_DATASET = {}

MOVIE_DATASET_NAME = ['MovieLens', 'Rotten Tomatoes', 'IMDB']
MOVIE_DATASET = read_dataset(MOVIE_DATASET_NAME, 'movie_data', 'movie')
# MOVIE_DATASET = {}

NETEASE_DATASET_NAME = ['Server17', 'Server164', 'Server230']
NETEASE_DATASET = read_dataset(NETEASE_DATASET_NAME, 'netease_data', 'netease')
# NETEASE_DATASET = {}