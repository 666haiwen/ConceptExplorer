## 数据说明

#### 文件夹结构

​	该文件夹存放后端处理好的数据,结构如下

```
\data
	\movie_data \\存放电影相关数据集内容
		\movie_lens
			data_0.npy
			label_0.npy
			configuration.json
			... 	//等等
		\netflix
		\rotten_tomatoes
		\twitter
		..
	\prsa_data
		\csv	\\原始csv数据
		\Guanyuan
		\Tiantan
		\Wanshouxigong
	..
```

​	数据可以向czx索取.

#### 子文件夹说明

​	每个数据集的子文件*(不同的数据源)*下，存放着该子数据集的数据，存放形式为`data_*.npy`和`label_*.npy`，分别代表特征数据和对应的标记数据集，均为`numpy`格式.

​	由于movie_lens和netflix数据量过大，容易造成内存不足现象，目前按照review的时序顺序，分割成了数个不同的子文件（例如`data_0.npy`等等），每个子文件最多包含100W条记录.



#### configuration

​	除此之外，还可能会包含`configuration.json`文件，该文件代表了该子数据集相关数据，目前包含每个`data_*.npy`的条目数量以及各个维度的取值范围，当然还包括该子数据集的整体(即综合所有`data_*.npy`得到的条目数和各个维度的取值范围)

​	**该文件在程序运行时会自动生成(tornado/stream/dataset.py).**



#### 数据格式说明(细节可见tornado/streams/dataset.py)

##### movie_data

```
MOVIE_SUB_DATASET = ['movie_lens', 'netflix', 'rotten_tomatoes', 'twitter']
MOVIE_ATTRIBUTES = [('year', 1), ('duration', 1), ('budget', 1),
		('direction', 1), ('genre', 10), ('language', 2), ('review_date', 1)]
MOVIE_DIM = 17
LABEL = [0, 1]
```



##### prsa_data

```
PRSA_SUB_DATASET = ['Guanyuan', 'Tiantan', 'Wanshouxigong']
PRSA_ATTRIBUTES = [('year', 1), ('month', 1), ('day', 1), ('hour', 1), 
        ('SO2', 1), ('NO2', 1), ('CO', 1), ('O3', 1), ('O3_8hours', 1), 
		('PM2.5', 1), ('PM2.5_day', 1), ('PM10', 1), ('PM10_day', 1), ('TEMP', 1), 
		('PRES', 1), ('DEWP', 1), ('RAIN', 1), ('WSPM', 1), ('wd', 4)]
PRSA_DIM = 22
LABEL = [0, 1]
```

空气质量数据实际存储的label为24小时候的AQI(Air quality index)指数,读取的时候自动换成了[0, 1]

$y = label > 100, \in[0, 1]$

