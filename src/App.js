import './App.css';
import { useEffect, useState } from 'react';
import Task from './components/TaskComponent';
import ReactModal from 'react-modal';

function App() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trackerList, setTrackerList] = useState({});
  const [filteredTrackerList, setFilteredTrackerList] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/app/getAll', {
      method: 'GET',
    }).then(data => {
      data.json().then(d => {
        setTrackerList(d)
      })
    })
  }, []);

  useEffect(() => {
    if (trackerList) {
      if (searchText.length > 0) {
        const updatedMap = {};
        Object.keys(trackerList).forEach(tId => {
          const t = trackerList[tId];
          if (t.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || t.description.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
            updatedMap[tId] = t;
          }
        });
        setFilteredTrackerList(updatedMap);
      } else {
        setFilteredTrackerList(trackerList);
      }
    }
  }, [searchText, trackerList]);

  function onChangeName(event) {
    setName(event.target.value);
  }

  function onChangeDescription(event) {
    setDescription(event.target.value);
  }

  function onClickSubmit(event) {
    event.preventDefault();
    let bodyData = {
      name,
      description
    }

    if(isModalOpen) {
      bodyData.startTime = startTime;
      bodyData.endTime = endTime;
    }

    fetch('http://localhost:4000/app/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    }).then((res) => {
      res.json().then((d) => {
        let updatedTrackerList = Object.assign({}, trackerList);
        updatedTrackerList[d.data._id] = d.data;
        setTrackerList(updatedTrackerList)
        setEndTime('');
        setStartTime('');
        setName('');
        setDescription('');
        setIsModalOpen(false);
      })
    }).catch((err) => {
      window.alert('Error saving')
    })
  }

  function onClickAddTracker() {
    setIsModalOpen(true);
  }

  function onChangeSearch(event) {
    setSearchText(event.target.value);
  }

  return (
    <div className="App">
      <div className='top'>
        <h1>Time Tracker</h1>
        <input type="text" value={name} name="name" placeholder="Enter task name" onChange={onChangeName} />
        <textarea value={description} name="description" placeholder="Enter description here" onChange={onChangeDescription} rows="4" cols="70" style={{
          marginBottom: '10px'
        }} />
        <div>
          <input type="submit" style={{
            marginRight: '10px'
          }} value="Submit" onClick={onClickSubmit} />
          <input type="submit" value="Add Manual Tracker" onClick={onClickAddTracker} />
        </div>
        <div>
          <input value={searchText} type='text' className='search' name='search' placeholder='Search by description/name' onChange={onChangeSearch} />
          <button onClick={() => setSearchText('')}>Reset</button>
        </div>

      </div>
      {filteredTrackerList && Object.keys(filteredTrackerList).length > 0 && (
        <div className='tracker-list'>
          {Object.keys(filteredTrackerList).map(taskId => {
            return (
              <Task keys={taskId} data={trackerList[taskId]} />
            )
          })}
        </div>
      )}
      <ReactModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <div className='modal-form'>
          <input type="text" value={name} name="name" placeholder="Enter task name" onChange={onChangeName} />
          <textarea value={description} name="description" placeholder="Enter description here" onChange={onChangeDescription} rows="4" cols="70" style={{
            marginBottom: '10px'
          }} />
          <label for="start">Start date:</label>

          <input type="datetime-local" id="start" name="trip-start"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >

          </input>
          <label for="start">End date:</label>

          <input type="datetime-local" id="end" name="trip-end"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          ></input>
          
          <button style={{
            marginTop: '20px'
          }} onClick={onClickSubmit}>Submit</button>
        </div>
      </ReactModal>
    </div>
  );
}

export default App;
