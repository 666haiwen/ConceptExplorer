import os
import json
import sys
import numpy as np
from django.http import *
from .utils import *
from .dataset import PRSA_DATASET, MOVIE_DATASET, NETEASE_DATASET


def get_timeline_data(request):
    return validate_get_request(request, _get_timeline_data)


def _get_timeline_data(request):
    start = int(request.GET['start'])
    end = int(request.GET['end'])
    dataset = request.GET['dataset']
    if dataset == 'prsa':
        dataset = PRSA_DATASET['dataset']
    elif dataset == 'movie':
        dataset = MOVIE_DATASET['dataset']
    elif dataset == 'netease':
        dataset = NETEASE_DATASET['dataset']

    length = len(dataset)
    pca = {}
    pca['data'] = [{'position': [], 'source': i} for i in range(length)]

    line = [{
        'data': [],
        'source': i,
        'batchStart': 0,
    } for i in range(length)]

    dataPane = [{
        'data': [],
        'source': i,
        'batchStart': 0,
        'matrixSelected': [],
        'name': dataset[i]['name']
    } for i in range(length)]

    for data_index, data in enumerate(dataset):
        start_index = search_index(data['delay']['time'], start)
        end_index = search_index(data['delay']['time'], end)
        dataPane[data_index]['batchStart'] = start_index
        line[data_index]['batchStart'] = start_index
        for i in range(start_index, end_index):
            pca['data'][data_index]['position'].append({
                'x': data['online']['position'][i][0],
                'y': data['online']['position'][i][1]
            })
            line[data_index]['data'].append({
                'accuracy': data['delay']['accuracy'][i],
                'pmin': data['delay']['pmin'][i],
                'bayes': data['delay']['nb_prob'][i],
                'state': data['delay']['state'][i],
                'time': data['delay']['time'][i]
            })
            dataPane[data_index]['data'].append({
                'warningLevel': data['delay']['warningLevel'][i],
                'dataNum': data['online']['dataNum'][i],
                'hit': data['delay']['hit'][i],
                'time': data['delay']['time'][i]
            })
        # end for i in range(start_index, end_index):
    return JsonResponse({
        'pca': pca,
        'line': line,
        'dataPane':dataPane,
    })



def get_attribute_matrix(request):
    return validate_post_request(request, __get_attribute_matrix)


def __get_attribute_matrix(request, test=False):
    receive = json.loads(request.body.decode())
    dataset = receive['dataset']
    datasetName = receive['dataset']
    time = receive['time']
    matrixSelected = receive['matrixSelected']
    if dataset == 'prsa':
        dataset = PRSA_DATASET['dataset']
        configure = PRSA_DATASET['configure']
    elif dataset == 'movie':
        dataset = MOVIE_DATASET['dataset']
        configure = MOVIE_DATASET['configure']
    elif dataset == 'netease':
        dataset = NETEASE_DATASET['dataset']
        configure = NETEASE_DATASET['configure']
    res = {
        'data': []
    }
    length = len(dataset)
    predicts = [0 for v in configure['attribute']['name']]
    attributes = [{
        'attribute': [],
        'source': i,
    } for i in range(length)]
    for index, v in enumerate(time):
        data_index = v['source']
        data = dataset[data_index]
        positive_res = np.zeros(configure['attribute']['size'])
        negative_res = np.zeros(configure['attribute']['size'])

        start_index = int(v['time'][0])
        end_index = int(v['time'][1]) + 1
        tmp_attr = [{
            'data': [],
            'name': v['attr']
        } for v in configure['attribute']['name']]
        tmp_predicts = [0 for v in configure['attribute']['name']]
        sub_predicts = [0 for v in configure['attribute']['name']]
        for i in range(start_index, end_index):
            if datasetName == 'prsa':
                positive_res += data['attribute']['negative'][i]
                negative_res += data['attribute']['positive'][i]
            else:
                positive_res += data['attribute']['positive'][i]
                negative_res += data['attribute']['negative'][i]
            for attr_index, attr in enumerate(data['delay']['attributes']):
                sub_predicts[attr_index] += attr['predict'][i] * data['online']['dataNum'][i]
                if matrixSelected[index]:
                    predicts[attr_index] += attr['predict'][i] * data['online']['dataNum'][i]
                tmp_predicts[attr_index] += attr['predict'][i] * data['online']['dataNum'][i]
                tmp_attr[attr_index]['data'].append({
                    'predict': attr['predict'][i],
                    'correlation': attr['correlation'][i],
                    'dataNum': data['online']['dataNum'][i],
                })
        avg_predicts = []
        for i, attr in enumerate(dataset[0]['delay']['attributes']):
            avg_predicts.append({'index': i, 'v': sub_predicts[i]})
        avg_predicts.sort(key=lambda x: x['v'], reverse=True)
        for i in range(5):
            attributes[data_index]['attribute'].append(tmp_attr[avg_predicts[i]['index']])

        res['data'].append({
                'positive': positive_res.tolist(),
                'negative': negative_res.tolist(),
                'source': data_index
            })
    avg_predicts = []
    for i, attr in enumerate(dataset[0]['delay']['attributes']):
        if attr['name'] == 'review_date':
            continue
        avg_predicts.append({'index': i, 'v': predicts[i]})
    avg_predicts.sort(key=lambda x: x['v'], reverse=True)
    res['topK'] = [v['index'] for v in avg_predicts]
    return JsonResponse({
        'res': res,
        'attributes': attributes,
    })


def get_datset(request):
    return validate_get_request(request, __get_dataset)


def __get_dataset(request):
    dataset_name = request.GET['datasetName']
    dataset = []
    configure = []
    if dataset_name == 'prsa':
        dataset = PRSA_DATASET['dataset']
        configure = PRSA_DATASET['configure']
    elif dataset_name == 'movie':
        dataset = MOVIE_DATASET['dataset']
        configure = MOVIE_DATASET['configure']
    elif dataset_name == 'netease':
        dataset = NETEASE_DATASET['dataset']
        configure = NETEASE_DATASET['configure']


    length = len(dataset)
    drift = []
    pca = [{'position': [], 'source': i} for i in range(length)]
    for i, data in enumerate(dataset):
        drift.append({
            'index': i,
            'drift': data['delay']['state'].tolist(),
            'dataNum': data['online']['dataNum'],
            'bayes': data['delay']['nb_prob'],
            'time': data['delay']['time']
        })
        for position in data['online']['position']:
            pca[i]['position'].append({
                    'x': position[0],
                    'y': position[1]
                })
    return JsonResponse({
        'configure': configure,
        'drift': drift,
        'pca': pca
    })
