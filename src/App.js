import logo from './logo.svg';
import './App.css';

import { useEffect, useState } from "react";
import { act } from "react-dom/cjs/react-dom-test-utils.development";
function App() {
  /*
assumption 
there are 8 telephone lines , 4 activeCalls , unlimited Queue calls


*/

  /* data structure 
telephones representation
0 -> first telephone
1 -> 2nd telephone and so on
-------------------------------
status representation
True -> available
False -> busy
----------------------------------
active call
source -> destination -> duration
eg.
[0,2,20] means telephone 0 as source telephone 1 as destination and 20 sec as duration

----------------------------------
queue call same as active call

-----------------------------


*/
  const [data, setData] = useState({
    status: [],
    activeCall: [],
    queueCall: [],
    allBusy: false,
    time: 0,
    n_totalCall: 0,
    n_sucessCall: 0,
    n_queueCall: 0,
    n_activeCall: 0,
  });
  const [time, setTime] = useState(0);
  const [timeSeriesData, setTimeSeriesData] = useState(new Set());

  // update the array of telephone Call system based on the time update
  useEffect(() => {
    setTime((time) => {
      if (data.time > time) {
        setTimeSeriesData((td) => {
          console.log([...td]);
          return new Set([...td, data]);
        });
        return time + 1;
      } else return time;
    });
  }, [data]);

  useEffect(() => {
    const nStatus = 8;
    setData((data) => {
      let status = [];
      for (let i = 0; i < nStatus; i++) {
        status.push(true);
      }
      return { ...data, status: status };
    });
  }, []);

  useEffect(() => {
    const nActiveCall = 4;

    /*
algorithm to initialize the system

set all the status of telephone to available
set active call status to zero number of calls
set the queue calls to zero number of calls
*/

    // convert to the setData compatible
    // for(let i=0;i<nStatus;i++){
    //     data.status.push(true);

    // }

    /* 
algorithm to make activeCall

for every random interval between 3 to 10 second generate new call

the source and destination of call are set randomly and duration is also set randomly

first check if the source is available or not then only choose that as source
and for destination you can choose any available or not 
after making choosing the source , destination and duration (20,30) make the source and 
destination both unavailable

*/

    const geterateRandomNumber = (lower, higher) => {
      let number = Math.random() * (higher - lower) + lower;
      number = Number.parseInt(number);
      return number;
    };

    const makeCallInterval = setInterval(() => {
      console.log("-------------------inside interval-----------------------");
      setData((data) => {
        let source;
        // check all are busy to avoid the hanging of program
        if (data.status.every((value) => value === false)) {
          return { ...data, allBusy: true };
        } else {
          do {
            source = geterateRandomNumber(0, nActiveCall);
          } while (!data.status[source]);
          // no need to check the source is availabe since checked by above loop
          if (data.status[source]) {
            let destination;
            // getting the destination that is ava
            do {
              destination = geterateRandomNumber(0, nActiveCall);
            } while (source === destination);

            let duration = geterateRandomNumber(20, 30);
            // pussing to queue only instead of activeCall
            let queueCall = [...data.queueCall];
            queueCall.push([source, destination, duration]);
            let status = [...data.status];
            status[source] = false;
            status[destination] = false;
            return { ...data, queueCall: queueCall, status: status };
          }
        }
      });
    }, geterateRandomNumber(5, 10) * 1000);

    /*
decrease counter interval and remove the duration fininshed calls


*/
    const eachSecondCounter = setInterval(
      () => {
        console.log("----------each second counter------------------");
        setData((data) => {
          return data;
        });
        // makeCall();

        setData((data) => {
          let activeCall = data.activeCall.map((value, index, array) => {
            let [source, destination, duration] = value;

            // updating duration
            duration = duration - 1;
            return [source, destination, duration];
          });
          return { ...data, activeCall: activeCall };
        });
        // -----------------------------------------------------------------------------------
        // filtering the  zero duration calls and making them available only when then are not in queueCall
        setData((data) => {
          // getting zero duration calls and telephoneSets
          let zero_duration_calls = data.activeCall.filter(
            (value, index, array) => value[2] === 0
          );
          let zero_duration_telephone_set = new Set();
          zero_duration_calls.forEach((value) => {
            let [source, destination, duration] = value;
            zero_duration_telephone_set.add(source);

            zero_duration_telephone_set.add(destination);
          });

          let activeTelephoneSet = new Set();
          data.activeCall.forEach((value) => {
            let src,
              des,
              dur = value;
            activeTelephoneSet.add(src);
            activeTelephoneSet.add(des);
          });

          let queueCallsTelephoneSet = new Set();
          // getting queue calls source
          data.queueCall.forEach((value) => {
            let [source, destination, duration] = value;
            queueCallsTelephoneSet.add(source);
            // we can free destination as they are not calling to another person or telephone
            // so we don't add to the destination to be mandatory and add them in available list
            // queueCallsTelephoneSet.add(destination);
          });

          // now queueCallsTelephones - zero_duration_telephone_set = telephones that are available to call

          function difference(setA, setB) {
            let _difference = new Set(setA);
            for (let elem of setB) {
              _difference.delete(elem);
            }
            return _difference;
          }

          function union(setA, setB) {
            let _union = new Set(setA);
            for (let elem of setB) {
              _union.add(elem);
            }
            return _union;
          }

          let availabeTelephones = difference(
            zero_duration_telephone_set,
            union(queueCallsTelephoneSet, activeTelephoneSet)
          );

          // finding only the duration_zero_telephone
          // ending the calls of zero duration calls and making them available
          let status = [...data.status];
          [...availabeTelephones].forEach((value, index, array) => {
            status[value] = true;
          });

          // duration zeor calls are added to success call list
          let n_sucessCall = data.n_sucessCall + [...availabeTelephones].length;

          return {
            ...data,
            status: status,
            n_sucessCall: n_sucessCall,
          };
        });

        // -------------------------------------------------------------------------------------
        // removing the zero duration calls from the active calls
        setData((data) => {
          let activeCall = data.activeCall.filter(
            (value, index, array) => value[2] !== 0
          );

          return { ...data, activeCall: activeCall };
        });

        // ------------------------------------------------------------------------------------
        // moving the source and destination to activeCall queue if destination is available in active call queue
        // number of activeCalls in activeCalls is less than maximum possible active calls
        // busy telephones set
        setData((data) => {
          // filter those call queque whose source and destination are not in acive queue

          let source_and_destination_of_active_call = new Set();

          data.activeCall.forEach((value) => {
            let [src, des, dur] = value;
            source_and_destination_of_active_call.add(src);
            source_and_destination_of_active_call.add(des);
          });
          let possible_call = data.queueCall.filter((value) => {
            let [src, des, dur] = value;
            // if source_and_destinato_of_acive_list is empty what the some function will return
            if (data.activeCall.length === 0) {
              return true;
            } else {
              // will return true and ! will return false
              return ![...source_and_destination_of_active_call].some(
                (item) => item == src || item == des
              );
            }
          });

          // filter those result whose source and destination are unique in result
          let bucket = new Set();
          let new_possible_call = [];
          possible_call.forEach((value) => {
            let [src, des, dur] = value;
            if (!(bucket.has(src) || bucket.has(des))) {
              new_possible_call.push(value);
              bucket.add(src);
              bucket.add(des);
            }
          });
          let possible_calls = new_possible_call;
          // finding the number of possible calls can be pushed
          let can_be_moved_to_activeCall = nActiveCall - data.activeCall.length;

          // mininum number of call can be moved to activeCall
          let final_number_of_call_to_be_moved = Math.min(
            can_be_moved_to_activeCall,
            possible_calls.length
          );
          let moved_to_activeQueue = [];
          for (let i = 0; i < final_number_of_call_to_be_moved; i++) {
            moved_to_activeQueue.push(possible_calls[i]);
          }

          let moved_to_activeQueueSet = new Set();
          moved_to_activeQueue.forEach((value) => {
            moved_to_activeQueueSet.add(value);
          });

          // removing the possible_calls from the queue calls
          //reverse filter the available calls in queueCall
          let queueCallSet = new Set();
          data.queueCall.forEach((value) => {
            queueCallSet.add(value);
          });

          function difference(setA, setB) {
            let _difference = new Set(setA);
            for (let elem of setB) {
              _difference.delete(elem);
            }
            return _difference;
          }

          let updatedQueueCallSet = difference(
            queueCallSet,
            moved_to_activeQueueSet
          );

          // updating the queueCall and activeCall
          let updatedActiveCall = [...data.activeCall, ...moved_to_activeQueue];
          let queueCall = [...updatedQueueCallSet];
          let n_queueCall = queueCall.length;
          let n_activeCall = updatedActiveCall.length;
          let n_totalCall = data.n_sucessCall + n_activeCall + n_queueCall;

          return {
            ...data,
            activeCall: updatedActiveCall,
            queueCall: queueCall,
            n_queueCall: n_queueCall,
            n_activeCall: n_activeCall,
            n_totalCall: n_totalCall,
          };
        });

        // making is busy or not
        setData((data) => {
          let isAllBusy;
          if (data.status.every((value) => value === false)) {
            console.log("all telphone are busy");
            isAllBusy = true;
          } else {
            isAllBusy = false;
          }
          console.log(data);
          // update time
          let time = data.time;
          time = time + 1;
          return { ...data, allBusy: isAllBusy, time: time };
        });
      },
      1 * 1000,
      data
    );
  }, []);

  return (
    <div className="App">
      <div className="container">
        <table>
          <tbody>
            <tr>
              <th>Time</th>
              <th>Telephone Status</th>
              <th>Active Calls</th>
              <th>Call in Queue</th>
              <th>Detail</th>
            </tr>

            {[...timeSeriesData].map((value, index) => {
              return (
                <tr key={index}>
                  {/* time */}
                  <td>{value.time}</td>
                  {/* time */}

                  {/* telephone status */}
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <th>Telephone</th>
                          <th>Statue</th>
                        </tr>
                        {value.status.map((value, index) => {
                          return (
                            <tr key={index}>
                              <td>t{index}</td>
                              <td>{Number(value)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                  {/* telephone status */}
                  {/* Active Calls */}
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <th>Source</th>
                          <th>Destination</th>
                          <th>Duration</th>
                        </tr>
                        {value.activeCall.map((value, index) => {
                          let [source, desetination, duration] = value;
                          return (
                            <tr key={index}>
                              <td>t{source}</td>
                              <td>t{desetination}</td>
                              <td>{duration} sec</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                  {/* Active Calls */}
                  {/*  Calls in queue */}
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <th>Source</th>
                          <th>Destination</th>
                          <th>Duration</th>
                        </tr>
                        {value.queueCall.map((value, index) => {
                          let [source, desetination, duration] = value;
                          return (
                            <tr key={index}>
                              <td>t{source}</td>
                              <td>t{desetination}</td>
                              <td>{duration} sec</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                  {/* Call in queue */}
                  {/* detail */}
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <th>Info</th>
                          <th>Number</th>
                        </tr>
                        <tr>
                          <td>Active Call</td>
                          <td>{value.n_activeCall}</td>
                        </tr>
                        <tr>
                          <td>Call in Queue</td>
                          <td>{value.n_queueCall}</td>
                        </tr>
                        <tr>
                          <td>Success Call</td>
                          <td>{value.n_sucessCall}</td>
                        </tr>
                        <tr>
                          <td>Total Call</td>
                          <td>{value.n_totalCall}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  {/* detail */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
