import os
import json
import numpy as np
from numpy.linalg import inv, norm
# from inc_pca import IncPCA
from scipy import spatial
from django.http import HttpResponseNotAllowed, HttpResponseBadRequest


def validate_get_request(request, func, accept_params=None, args=None):
    """Check if method of request is GET and request params is legal

    Args:
         request: request data given by django
         func: function type, get request and return HTTP response
         accept_params: list type, acceptable parameter list

    Returns:
         HTTP response
    """
    if accept_params is None:
        accept_params = []
    if args is None:
        args = []
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET'])
    elif set(accept_params).issubset(set(request.GET)):
        return func(request, *args)
    else:
        return HttpResponseBadRequest('parameter lost!')


def validate_post_request(request, func, accept_params=None, args=None):
    """Check if method of request is POST and request params is legal

    Args:
         request: request data given by django
         func: function type, get request and return HTTP response
         accept_params: list type, acceptable parameter list

    Returns:
         HTTP response
    """
    if accept_params is None:
        accept_params = []
    if args is None:
        args = []
    if request.method != 'POST':
        return HttpResponseNotAllowed(['POST'])
    elif set(accept_params).issubset(set(request.POST)):
        return func(request, *args)
    else:
        return HttpResponseBadRequest('parameter lost!')


def read_json_file(filepath):
    try:
        with open(filepath, encoding='utf-8') as fp:
            return json.load(fp)
    except EnvironmentError:
        return { 'error' : 'File not found!' }


def Wasserstein(x, y):
    return np.sum((x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2)


def Cosin(x, y):
    return spatial.distance.cosine(x, y)


def Euclidean(x, y):
    shape = x.shape
    if len(shape) > 1:
        return norm(x[0] - y[0])
    elif len(shape) == 1:
        return norm(x - y)


def KL_divergence(x, y):
    """
        Calculate KL_divergence between x and y;
        x and y are N-dimensions Normal Distribution.
        shape: (2, N): mean and sigma
    """
    if x.shape != y.shape:
        raise ValueError('The shape of x and y are not same, x is {} however y is {}',format(x.shape, y.shape))
    ux = x[0]
    uy = y[0]
    diff = ux - uy
    _diff = -diff
    covx = np.log(x[1])
    covy = np.log(y[1])
    _covx = 1 / covx
    _covy = 1 / covy
    sumx = sum(covx)
    sumy = sum(covy)
    n = ux.shape[0]
    # (u1 - u2)^T  * cov2^(-1) * (u1 - u2)
    # +
    # (u2 - u1)^T  * cov1^(-1) * (u2 - u1)
    item = np.dot(diff * _covy, diff) + np.dot(_diff * _covx, _diff)
    trace = np.dot(_covy, covx) + np.dot(_covx, covy)
    dis = np.log(sumx / sumy) + np.log(sumy / sumx) + trace + item
    return dis / 2 - n


def random_warning(start, end, number=15):
    type_name = ['CONCEPT_ALERT', 'CONCEPT_DRIFT']
    result = []
    interval = (end - start) / number
    for i in range(number):
        a = np.random.randint(interval * i, interval * (i + 1))
        b = np.random.randint(interval * i, interval * (i + 1))
        result.append({
            'start': min(a, b),
            'end': max(a, b),
            'type': type_name[np.random.randint(0, len(type_name))]
        })
    return result

def random_data(start, end, warning, name, index, attributeNum=10, num=1000):
    interval = (end - start) / num
    dataNum = np.random.randint(20, 100, size=num)
    bingo = dataNum - np.random.randint(10, size=num)
    attributes = [{
        'name': j,
        'predict': [np.random.rand(num).tolist()],
        'correlation': (np.random.rand(num) * 2 - 1).tolist(),
        'num': 1
    } for j in range(attributeNum)]
    data = {
        'name': name,
        'delay': {
            'time': [i * interval for i in range(num)],
            'state': np.zeros(num),
            'accuracy': np.random.rand(num).tolist(),
            'bingo': bingo.tolist(),
            'warningLevel': np.random.randint(3, size=num).tolist(),
            'attributes': attributes
        },
        'online': {
            'weight': np.random.rand(num, 200),
            'time': [i * interval for i in range(num)],
            'index': [],
            'position': [],
            'dataNum': dataNum.tolist(),
        }
    }
    for v in warning['warning']:
        start_time = int((v['start'] - start) / interval)
        end_time = int((v['end'] - start) / interval)
        data['delay']['state'][start_time: end_time] = 1
        data['delay']['state'][end_time] = 2 if v['type'] == 'CONCEPT_DRIFT' else 3
    return data


def search_index(time, v):
    # if v < time[0]:
    #     return -1
    # if v > time[-1]:
    #     return -2
    left = 0
    right = len(time) - 1
    while left < right:
        mid = int((left + right) / 2)
        if time[mid] > v:
            right = mid
        else:
            left = mid + 1
    return max(left, right)