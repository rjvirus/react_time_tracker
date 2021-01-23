import './App.css';
import { useEffect, useState } from 'react';
import Task from './components/TaskComponent';
import ReactModal from 'react-modal';

function App() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trackerList, setTrackerList] = useState([]);
  const [filteredTrackerList, setFilteredTrackerList] = useState([]);
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
        const updatedArrray = [];
        trackerList.forEach(t => {
          if (t.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || t.description.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
            updatedArrray.push(t)
          }
        });
        setFilteredTrackerList(updatedArrray);
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

    if (isModalOpen) {
      bodyData.startTime = startTime;
      bodyData.endTime = endTime;
    }

    fetch('http://localhost:4000/app/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    }).then((res) => {
      res.json().then((d) => {
        let updatedTrackerList = [...filteredTrackerList];
        updatedTrackerList.push(d.data);
        setTrackerList(updatedTrackerList);
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
        <input type="text" value={name} name="name" placeholder="Enter task name*" onChange={onChangeName} />
        <textarea value={description} name="description" placeholder="Enter description here" onChange={onChangeDescription} rows="4" cols="70" style={{
          marginBottom: '10px'
        }} />
        <div>
          <input type="submit" disabled={name.length < 1} style={{
            marginRight: '10px'
          }} value="Submit" onClick={onClickSubmit} />
          <input type="submit" value="Add Manual Task" onClick={onClickAddTracker} />
        </div>
        <div>
          <input value={searchText} type='text' className='search' name='search' placeholder='Search by description/name' onChange={onChangeSearch} />
          <button onClick={() => setSearchText('')}>Reset</button>
        </div>

      </div>
      {filteredTrackerList && filteredTrackerList.length > 0 && (
        <div className='tracker-list'>
          {filteredTrackerList.map(task => {
            return (
              <Task keys={task._id} data={task} />
            )
          })}
        </div>
      )}
      <ReactModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
        <div className='modal-form'>
          <input style={{
            border: '1px solid black'
          }} type="text" value={name} name="name" placeholder="Enter task name *" onChange={onChangeName} />
          <textarea value={description} name="description" placeholder="Enter description here" onChange={onChangeDescription} rows="4" cols="70" style={{
            marginBottom: '10px',
            border: '1px solid black'
          }} />
          <label for="start">Start date*:</label>

          <input type="datetime-local" id="start" name="trip-start"
            value={startTime}
            style={{
              marginBottom: '10px'
            }}
            onChange={(e) => setStartTime(e.target.value)}
          >

          </input>
          <label for="start">End date:</label>

          <input type="datetime-local" id="end" name="trip-end"
            style={{
              marginBottom: '10px'
            }}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          ></input>

          <button style={{
            marginTop: '20px',
            width: '200px'
          }} disabled={startTime === '' || name === ''} onClick={onClickSubmit}>Submit</button>
          <button style={{
            width: '200px'
          }} onClick={() => setIsModalOpen(false)}>Close Dialog</button>
        </div>
      </ReactModal>
    </div>
  );
}

export default App;
