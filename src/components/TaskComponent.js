import React, { useEffect, useState } from 'react';
import difference_in_seconds from 'date-fns/differenceInSeconds';
import { format } from 'date-fns';
import { Card } from '@material-ui/core';


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

    function onClickRemove() {
        fetch(`http://localhost:4000/app/task/action/${props.data._id}/remove`, {
            method: 'POST'
        }).then((res) => {
            res.json().then((d) => {
                props.onRemove(data._id)
            });
        }).catch((err) => {
            window.alert('Error saving')
        })
    }

    const time = secondsToTime(timeSpentInSec + runningTime);
    const startedTime = allTrackers?.[allTrackers.length - 1]?.startTime;
    const endTime = allTrackers?.[0]?.endTime;
    const formattedStartTime = startedTime ? format(new Date(startedTime), 'dd MMM yyyy hh:mm a') : '-';
    const formattedEndTime = endTime ? format(new Date(endTime), 'dd MMM yyyy hh:mm a') : '-';

    return (
        <Card className='tracker' variant='elevation'>
            <div>
                <p>{data.name}</p>
                <p style={{
                    fontSize: '13px'
                }}>Start Time: {formattedStartTime}</p>
                <p style={{
                    fontSize: '13px'
                }}>End Time: {formattedEndTime}</p>
                <p style={{
                    width: '250px'
                }}>{data.description}</p>
            </div>
            <div>
                <p>Total time spent</p>
                <p>{time ? `${time.h} hour ${time.m} mins ${time.s} sec` : '-'}</p>
            </div>
            <div>
                <button style={{
                    marginRight: '10px'
                }} onClick={() => currentTracker ? onClickPause() : onClickResume()}>{currentTracker ? 'Pause' : 'Resume'}</button>
                <button onClick={() => onClickRemove()}>Remove</button>
            </div>
        </Card>
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