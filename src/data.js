
/*
assumption 
there are 8 telephone lines , 4 activeCalls , unlimited Queue calls


*/

const nStatus = 8;
const nActiveCall = 4;

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
const data = {
    'status':[],
    'activeCall':[],
    'queueCall':[],
    'allBusy':false,
    'time':0,
}



/*
algorithm to initialize the system

set all the status of telephone to available
set active call status to zero number of calls
set the queue calls to zero number of calls
*/

for(let i=0;i<nStatus;i++){
    data.status.push(true);
}


/* 
algorithm to make activeCall

for every random interval between 3 to 10 second generate new call

the source and destination of call are set randomly and duration is also set randomly

first check if the source is available or not then only choose that as source
and for destination you can choose any available or not 
after making choosing the source , destination and duration (20,30) make the source and 
destination both unavailable

*/

const geterateRandomNumber = (lower,higher)=> {
   let number =  Math.random()*(higher - lower) + lower;
   number = Number.parseInt(number);
   return number;
}


console.log(geterateRandomNumber(1,10));
function makeCall(data){
    
const makeCallInterval = setTimeout(function interalFunction(data){


        console.log('-------------------inside interval-----------------------');
        let source;
        // check all are busy to avoid the hanging of program
        if(data.status.every((value)=> value === false)){
            console.log('all telphone are busy');
            data.allBusy = true;
            
        }
        else{

            do{
    
            source = geterateRandomNumber(0,nActiveCall);
            }while(!data.status[source]);
            // no need to check the source is availabe since checked by above loop
            if (data.status[source]){
                let destination;
                // getting the destination that is ava
                do{
                    destination = geterateRandomNumber(0,nActiveCall);
                }while(source === destination );

                let duration = geterateRandomNumber(20,30);

                // before pushing to the activeCall first checking is the active call queue is full
                // also checking the destination is available or not
                if(data.activeCall.length < nActiveCall && data.status[destination] == true) {

                    data.activeCall.push([source,destination,duration]);
                    
                    data.status[source] = false;
                    data.status[destination] = false;
                }
                else{
                    data.queueCall.push([source,destination,duration]);
                    data.status[source] = false;
                    data.status[destination] = false;
                }
    

            }
    
            // console.log(data);
        }
        


},geterateRandomNumber(10,20)*1000,data);


}
    


/*
decrease counter interval and remove the duration fininshed calls


*/
const eachSecondCounter = setInterval(function counter(data){
    makeCall(data);
   
    // update time
    data.time += 1;
    console.log('----------each second counter------------------');
    console.log(data.time);

    // decrease duratation 
    data.activeCall = data.activeCall.map((value,index,array)=>{
        let [source,destination,duration] = value;

        // updating duration
        duration = duration -1;
        return [source,destination,duration];
    });

    // filtering the  zero duration calls and making them available
    let duratation_zero_calls = data.activeCall.filter((value,index,array)=> value[2] === 0);

    // ending the calls of zero duration calls and making them available
    duratation_zero_calls.forEach((value,index,array)=>{
        let [source,destination,duration] = value;
        data.status[source] = true;
        data.status[destination] = true;
    })
    
    // removing the zero duration calls from the active calls
    data.activeCall = data.activeCall.filter((value,index,array)=>value[2] !== 0);

    // moving the source and destination to activeCall queue if destination is available in active call queue  
    // number of activeCalls in activeCalls is less than maximum possible active calls
    // busy telephones set
    let activeCallSet = new Set();
    data.activeCall.forEach((value)=>{
        let [source,destination,duration] = value;
        activeCallSet.add(source);
        activeCallSet.add(destination);

    })
    // filter the available calls in queueCall 
    let possible_calls = data.queueCall.filter((value,index,array)=>{
        let [source,destination,duration] = value;
        // if the receiver or destination is free then the caller can call
       if(activeCallSet.has(destination)){
           return false;
       }
       else{
           return true;
       }

    });

    console.log(possible_calls);
    // finding the number of possible calls can be pushed
    let can_be_moved_to_activeCall = nActiveCall - data.activeCall.length;
    console.log(can_be_moved_to_activeCall);
    
    // mininum number of call can be moved to activeCall
    let final_number_of_call_to_be_moved =  Math.min(can_be_moved_to_activeCall,possible_calls.length);
    console.log(final_number_of_call_to_be_moved);
    let moved_to_activeQueue = [];
    for(let i = 0; i<final_number_of_call_to_be_moved;i++){
        data.activeCall.push(possible_calls[i]);
        moved_to_activeQueue.push(possible_calls[i]);
    }

    console.log(moved_to_activeQueue);

    let moved_to_activeQueueSet = new Set();
    moved_to_activeQueue.forEach((value)=>{
        moved_to_activeQueueSet.add(value);
    })
    // removing the possible_calls from the queue calls
    //reverse filter the available calls in queueCall 
    let queueCallSet = new Set();
    data.queueCall.forEach((value)=>{
        queueCallSet.add(value);
    })

    function difference(setA, setB) {
        let _difference = new Set(setA)
        for (let elem of setB) {
            _difference.delete(elem)
        }
        return _difference
    }

    let updatedQueueCallSet = difference(queueCallSet,moved_to_activeQueueSet);

    // updating the queueCall
    data.queueCall = [...updatedQueueCallSet];

  

    if(data.status.every((value)=> value === false)){
        console.log('all telphone are busy');
        data.allBusy = true;
                
    }
    console.log(data);


},1*1000,data);

export default data;