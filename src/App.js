import './App.css';
import { useEffect, useRef, useState } from 'react';
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
        setTotalPage(Math.ceil(d.length / pageLimitRef));
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
      <div class="row">
        <div class="column first-column">
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

        </div>
        <div class="column">
          <div>
            <input value={searchText} type='text' className='search' name='search' placeholder='Search by description/name' onChange={onChangeSearch} />
            <button onClick={() => setSearchText('')}>Reset</button>
          </div>
          {!searchText && (
            <div className='list-nav' style={{
              marginTop: '10px'
            }}>
              <div>
                <p style={{ fontSize: '12px' }}>Current Page : {currentPage}</p>
                <p style={{ fontSize: '12px' }}>Total Pages : {totalPage}</p>
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
              </div>
              <div>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>{'< Previous'}</button>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPage || totalPage === 0}>{'Next >'}</button>
              </div>
            </div>
          )}
          {filteredTrackerList && filteredTrackerList.length > 0 && (
            <div className='tracker-list'>
              {filteredTrackerList.map(task => {
                return (
                  <Task keys={task._id} data={task} onRemove={() => onRemove(task._id)} />
                )
              })}
            </div>
          )}
        </div>
      </div>
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
