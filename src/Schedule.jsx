import React, { Component } from 'react';
import { httpClient } from "./handlers/axiosConfig"
import Cookies from 'universal-cookie'
import { ClipLoader } from 'react-spinners';
import 'react-big-scheduler/lib/css/style.css'
import Scheduler, {SchedulerData, ViewTypes, DATE_FORMAT} from 'react-big-scheduler'
import {DragDropContext} from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import moment from 'moment'
class Schedule extends Component {
    constructor(props){
        super(props)
        this.state = {
            loading:false,
            data:[],
            emails:[],
            shifts:[]
        }
    }
    //make request to get volunteer data again
    componentDidMount() {
        const cookie = new Cookies();
        const request_data = {
            "email": cookie.get("email"),
            "token": cookie.get("auth")
        }
        this.setState({
            loading: true
        })
        httpClient.post("/getvolunteers", request_data).then(response => {
            if (response.data.statusCode === 200) {
                this.setState({
                    data: response.data.body,
                    loading: false
                })
                if(this.state.data.length > 0){
                    //extract the emails as resources and shifts as the times
                    let emails = []
                    let shifts = []
                    for(let i=0;i<this.state.data.length;i++){
                       const volunteer = this.state.data[i]
                        emails.push({
                            "id":volunteer.email,
                            "name":volunteer.first_name
                        })
                        //if a shift key exists
                        if("shifts" in volunteer){
                            shifts.push(volunteer.shifts)
                        }
                    }
                    this.setState({
                        "emails":emails,
                        "shifts":shifts
                    })
                }
            }
            else {
                alert(response.data.body)
            }
        })
    }
    //stuff with the scheduler
 
    setupScheduler(){
        const schedulerData = new SchedulerData(new moment().format(DATE_FORMAT), ViewTypes.Day);
        schedulerData.setResources(this.state.emails);
        schedulerData.setEvents(this.state.shifts);
        return schedulerData;
    }
    prevClick = (schedulerData)=> {
        schedulerData.prev();
       console.log("prev")
    }

    nextClick = (schedulerData)=> {
        console.log("next")
    }
    onViewChange = (schedulerData, view) => {
        console.log("view changed")
    }

    onSelectDate = (schedulerData, date) => {
        console.log("date selected")
    }

    newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
            console.log("Called")

            let newFreshId = 0;
            schedulerData.events.forEach((item) => {
                if(item.id >= newFreshId)
                    newFreshId = item.id + 1;
            });

            let newEvent = {
                id: newFreshId,
                title: 'New event you just created',
                start: start,
                end: end,
                resourceId: slotId,
                bgColor: 'purple'
            }
            schedulerData.addEvent(newEvent);
            this.setState({
                viewModel: schedulerData
            })
        
    }

    render(){
        if(this.state.loading){
            return (
                <div>
                    <div className='sweet-loading'>
                        <ClipLoader
                            sizeUnit={"px"}
                            size={150}
                            color={'#123abc'}
                            loading={this.state.loading}
                        />
                    </div>
                </div>
            )
        }
        //display actual schedule now
        else{
            return(
                <Scheduler schedulerData={this.setupScheduler()}
                            newEvent={this.newEvent}
                            nextClick={this.nextClick}
                            prevClick={this.prevClick}
                            onViewChange={this.onViewChange}
                            onSelectDate={this.onSelectDate}
     />
            )
        }
    }
}
export default DragDropContext(HTML5Backend)(Schedule)