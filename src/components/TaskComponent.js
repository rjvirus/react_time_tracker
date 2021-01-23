import React, { useEffect, useState } from 'react';
import difference_in_seconds from 'date-fns/differenceInSeconds';
import {format} from 'date-fns';


export default function TaskComponent(props) {
    const [data, setData] = useState(props.data);
    const [currentTracker, setCurrentTracker] = useState(null);
    const [allTrackers, setAllTrackers] = useState([]);
    const [timeSpentInSec, setTimeSpentInSec] = useState(0);
    const [runningTime, setRunningTime] = useState(0);

    useEffect(() => {
        setData(props.data);
        fetch(`http://localhost:4000/app/task/tracks/${props.data._id}`, {
            method: 'GET',
        }).then(data => {
            data.json().then(d => {
                d.sort(function (a, b) {
                    return new Date(b.startTime) - new Date(a.startTime);
                });
                setAllTrackers(d)
            });
        }).catch((err) => {
            err.text().then(t => {
                window.alert(t)
            })
        })
    }, [props.data]);

    useEffect(() => {
        console.log('Hi')
        const filtered = allTrackers.filter(t => t.endTime === null);
        if (filtered?.length === 1) {
            setCurrentTracker(filtered[0])
        } else {
            setCurrentTracker(null)
        }
        let diff = 0;
        allTrackers.forEach(track => {
            if (track.endTime) {
                diff += difference_in_seconds(new Date(track.endTime), new Date(track.startTime));
            }
        });
        console.log(diff)
        setTimeSpentInSec(diff);
    }, [allTrackers]);

    useEffect(() => {
        if (currentTracker) {
            const interval = setInterval(() => {
                const secs = difference_in_seconds(new Date(), new Date(currentTracker.startTime));
                setRunningTime(secs)
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setRunningTime(0)
        }
    }, [currentTracker]);

    function onClickPause() {
        fetch(`http://localhost:4000/app/task/action/${currentTracker._id}/pause`, {
            method: 'POST'
        }).then((res) => {
            res.json().then((d) => {
                let updatedArray = [...allTrackers];
                const trackerIndex = updatedArray.findIndex(t => t._id === d.data._id);
                updatedArray[trackerIndex] = d.data;
                updatedArray.sort(function (a, b) {
                    return new Date(b.startTime) - new Date(a.startTime);
                });
                setAllTrackers(updatedArray);
                setCurrentTracker(null);
            });
        }).catch((err) => {
            window.alert('Error saving')
        })
    }

    function onClickResume() {
        fetch(`http://localhost:4000/app/task/action/${props.data._id}/resume`, {
            method: 'POST'
        }).then((res) => {
            res.json().then((d) => {
                let updatedArray = [...allTrackers];
                updatedArray.push(d.data);
                updatedArray.sort(function (a, b) {
                    return new Date(b.startTime) - new Date(a.startTime);
                });
                setAllTrackers(updatedArray);
                setCurrentTracker(d.data)
            });
        }).catch((err) => {
            window.alert('Error saving')
        })
    }

    const time = secondsToTime(timeSpentInSec + runningTime);
    const startedTime = allTrackers?.[allTrackers.length - 1]?.startTime;
    const endTime = allTrackers?.[0]?.endTime;
    const formattedStartTime = startedTime ? format(new Date(startedTime), 'dd/MM/yyyy hh:mm a') : '-';
    const formattedEndTime = endTime ? format(new Date(endTime), 'dd/MM/yyyy hh:mm a') : '-';

    return (
        <div className='tracker'>
            <div>
                <p>{data.name}</p>
                <p>Start Time: {formattedStartTime}</p>
                <p>End Time: {formattedEndTime}</p>
            </div>
            <div>
                <p>Total time spent</p>
                <p>{time ? `${time.h} hour ${time.m} mins ${time.s} sec` : '-'}</p>
            </div>
            <div>
                <button onClick={() => currentTracker ? onClickPause() : onClickResume()}>{currentTracker ? 'Pause' : 'Resume'}</button>
            </div>
        </div>
    )
}

function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}