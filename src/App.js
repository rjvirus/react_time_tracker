import './App.css';
import { useEffect, useRef, useState } from 'react';
import Task from './components/TaskComponent';
import { Button, Dialog, DialogTitle, DialogActions } from '@material-ui/core';


function App() {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trackerList, setTrackerList] = useState([]);
  const [filteredTrackerList, setFilteredTrackerList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [pageLimit, setPageLimit] = useState(6);
  const pageLimitRef = useRef(pageLimit);

  useEffect(() => {
    fetch(`http://localhost:4000/app/getAll`, {
      method: 'GET',
    }).then(data => {
      data.json().then(d => {
        setTrackerList(d);
        setTotalPage(Math.ceil(d.length / pageLimitRef.current));
      })
    })
  }, []);

  useEffect(() => {
    if (trackerList?.length) {
      if (searchText.length > 0) {
        const updatedArrray = [];
        trackerList.forEach(t => {
          if (t.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || t.description.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
            updatedArrray.push(t)
          }
        });
        setFilteredTrackerList(updatedArrray);
      } else {
        const updated = trackerList.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
        const totalPages = Math.ceil(trackerList.length / pageLimit)
        setTotalPage(totalPages);
        if (!updated.length) {
          setCurrentPage(totalPages);
        }
        setFilteredTrackerList(updated);
      }
    }
  }, [searchText, trackerList, currentPage, pageLimit]);

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
        let updatedTrackerList = [...trackerList];
        updatedTrackerList.unshift(d.data);
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

  function onRemove(id) {
    const updatedTrackerList = trackerList.filter(t => t._id !== id);
    setTrackerList(updatedTrackerList);
  }

  return (
    <div className="App">
      <div className="row">
        <div className="column first-column">
          <h1>Time Tracker</h1>
          <input type="text" value={name} name="name" placeholder="Enter task name*" onChange={onChangeName} />
          <textarea value={description} name="description" placeholder="Enter description here" onChange={onChangeDescription} rows="4" cols="70" style={{
            marginBottom: '10px'
          }} />
          <div>
            <Button style={{
              marginRight: '10px'
            }} disabled={name.length < 1} variant='contained' onClick={onClickSubmit}>Start Tracking</Button>
            <Button variant='contained' onClick={onClickAddTracker}>Add Tracker Manually</Button>
          </div>

        </div>
        <div className="column">
          <div style={{
            padding: '20px'
          }}>
            <input value={searchText} type='text' className='search' name='search' placeholder='Search by description/name' onChange={onChangeSearch} />
            <button style={{
              marginLeft: '5px'
            }} onClick={() => setSearchText('')}>Reset</button>
          </div>
          {!searchText && (
            <div className='list-nav' style={{
              marginTop: '10px'
            }}>
              <div>
                <span style={{ fontSize: '12px' }}>Page Limit : </span>
                <select name="limit" id="limit" value={pageLimit.toString()} onChange={(e) => {
                  setPageLimit(parseInt(e.target.value))
                }}>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                  <option value="8">10</option>
                  <option value="8">15</option>
                </select>
              </div>
              <div>
                <span style={{ fontSize: '12px', marginRight: '5px' }}>{currentPage} of {totalPage}</span>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>{'< Previous'}</button>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPage || totalPage === 0}>{'Next >'}</button>
              </div>
            </div>
          )}
          {filteredTrackerList && filteredTrackerList.length > 0 && (
            <div className='tracker-list'>
              {filteredTrackerList.map(task => {
                return (
                  <Task key={task._id} data={task} onRemove={() => onRemove(task._id)} />
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className='modal-form' style={{
          padding: '25px'
        }}>
          <DialogTitle>Add Manual Tracker</DialogTitle>
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

          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} variant='contained' color="primary">
              Cancel
            </Button>
            <Button disabled={startTime === '' || name === ''} variant='contained' onClick={onClickSubmit} color="primary" autoFocus>
              Submit
          </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
}

export default App;
