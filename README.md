# ConceptExplorer: Visual Analysis of Concept Drifts in Multi-source Time-series Data

This is the code repository of ConceptExplorer in Vast 2020.

Online system please visit http://101.132.126.253/.



## Dataset

We can only provide two real-world datasets due to certain confidentiality agreements.



**Beijing Air Quality Forecast Datasets**

paper: S. Zhang, B. Guo, A. Dong, J. He, Z. Xu, and S. X. Chen. Cautionary tales on air-quality improvement in Beijing. Proceedings of the Royal Society A: Mathematical, Physical and Engineering Sciences, 473(2205):20170457, 2017

datasets: https://archive.ics.uci.edu/ml/datasets/Beijing+Multi-Site+Air-Quality+Data



**Movie Rating Prediction Datasets**

Movie description: https://www.kaggle.com/rounakbanik/the-movies-dataset

Twitter dataset:  https://github.com/sidooms/MovieTweetings

MovieLens 20M dataset: https://www.kaggle.com/grouplens/movielens-20m-dataset

Rotten Tomatoes dataset: https://www.kaggle.com/stefanoleone992/rotten-tomatoes-movies-and-critics-datasets.



## Data preprocessing

After download datasets, you should preprocess the datasets and do some necessary operations  such as **Drift Level Index** **Calculate** and **The Consistency Judgment Model** to get result that showed in the system.

Please refer to the paper for the specific calculation process. The final result should have the following structure.

```
dataset: {
        'name': string,		// name of dataset，eg: 'netflex'
        'attribute': {		// matrix of attribution
            'negative':	array,
            'positive': array,	//darray,
            					//shape = (batchNum, splitAttrSize, splitAttrSize)
        }
        'delay': {			// results after get label
            'time': [], 		// list, timestamp of each batch, saved by UNIX Time
            'accuracy': [], 	// list, model accuracy of this batch
            'nb_prob': []           // list, Bayes Predicted probability of this batch's drift level
            'batch_delay': number       // offset of nb_prob
            'hit': [], 		// hit or not of this bacht(1 means hit, 0 mmeans miss)
            'warning': [{
                'start': number		// start timestamp of this warning
                'end': number,		// end timestamp of this warning
                'max_accuracy': [],        // 1-Pmin of each warning
                'max_accuracy_time': [],        // timestamp of each 1-Pmin
                'backend_accuracy '：[]    // backend accuracy of each warning
        	}]，
        	'drift': [{
                'start': number,		// start timestamp of each drift
                'end': number,		// end timestamp of each drift
                'max_accuracy': [],        // 1-Pmin of each drift
                'max_accuracy_time': [],        // timestamp of each 1-Pmin
                'backend_accuracy '：[]    // backend accuracy of each drift
        	}],
        	'warningLevel': [		// threshold of warning level
                'avg': number,
                'max': number
            ],
            'attributes': [{
                    'name': string, // Attribution Name
                    'predict': [],		// Correlation between attribution and label of this batch
                    'correlation': []	，	// Correlation between previous batch and  this batch
                     num: number            // Dimension of this attribution
                },
                ...// May have K-Attributions
            ]
        }，

        'online': {		// Online result without label
        	'time': [], 		//list, timestamp of each batch, saved by UNIX ime
        	'weight': ndarray(num, attribute_num),	// model weight, saved by numpy
        	'dataNum': [] 		// data num of each bacth, eg: The number of records of Netflix data in one day
        }
}


// online_num = dataset.online.time.length
// delay_num = dataset.delay.time.length
// online_num - delay_num = C （const number) when delay_num > 0

```



## Run system

The system consists of the frontend and the backend.

### Backend Install && Usage

The backend provide data used in frontend.

#### Environment dependency

This code can be used in Windows/Linux/OS environment with python3.

##### Install Python3

https://wiki.python.org/moin/BeginnersGuide/Download

**Install required package**

```
django >= 2.1
numpy >= 1.16
sklearn
```



#### Start command

Change directory to `backend\`, Run Command:

`python manage.py runserver 8000`

Backend server will start at your localhost:8000. You can change server address by command `python manage.py runserver [ip]:[port]`



### Frontend

#### Environment dependency

This code can be used in Windows/OS environment.

1. node.js
2. yarn



##### Install Node.js

https://nodejs.org/en/

Please add node.js into your **environment variables**



##### Install Yarn

https://yarnpkg.com/



##### Install Package and Usage

Change directory to `frontend\`,

First install required package:

`yarn install`

Then, start:

`yarn start`

