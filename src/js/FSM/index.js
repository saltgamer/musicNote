/***
 * file name : FSM/index.js
 * description : state machine class
 * create date : 2018-11-07
 * creator : saltgamer
 * https://github.com/nhnent/fe.javascript/wiki/April-23---April-27,-2018
 * https://www.smashingmagazine.com/2018/01/rise-state-machines/
 ***/

export default class StateMachine {
    constructor(transitions) {
        this.state = 'idle';
        /* this.transitions = {
             idle: {
                 click: () => {
                     this.changeStateTo('fetching');


                 }
             },
             fetching: {
                 success: () => {
                     this.changeStateTo('idle');
                 },
                 failure: (error) => {
                     this.changeStateTo('error');
                 }
             },
             error: {
                 retry: () => {
                     this.changeStateTo('idle');
                     this.dispatch('click');
                 }
             }
         };*/
        this.transitions = transitions;
        console.log(`~> initial state: ${ this.state }`);

    }

    dispatch(actionName, ...payload) {
        const actions = this.transitions[this.state],
            action = this.transitions[this.state][actionName];

        if (action) {
            console.log(`~> action dispatched: ${ actionName }`);
            action.apply(this, payload);
        }
    }

    changeStateTo(newState) {
        console.log(`~> state changed: ${ newState }`);
        this.state = newState;
    }

   /* watchTime(params) {
        this.timer = setInterval(() => {
            console.log(params.currentTime);
            if (params.currentTime >= params.sectionEnd) {
                params.callBack();
                clearInterval(this.timer);
            }
        }, 100)
    }*/

}

