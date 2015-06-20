/**
 * Created by wander on 15-6-20.
 */

module device.accelerator {



    export var EVENT_ACCELERATOR:string = "event_accelerator";

    export var EVENT_SHAKE:string = "event_shake";

    /**
     *
     * @param callback
     * @callback-param  {accelerator:true} 是否支持传感器
     */
    export function isSuppport(callback){

        var isSupport = window["DeviceMotionEvent"] ? true : false;
        var result = {

            accelerator : isSupport

        }
        callback(result);
    }

    export interface AccelerationEvent {

        x:number;

        y:number;

        z:number;

        type:string;

        /**
         * 摇一摇的速度，一般超过500即可认为用户摇了
         */
        speed:number;

    }


    var $registerType:any = {};

    var $lastShakeEvent:AccelerationEvent;

    var $lastShakeTimestamp:number = 0;


    /**
     *
     * @param eventType
     * @param listener
     * @callback-param AccelerationEvent
     */
    export function addEventListener(eventType:string , listener:Function) {

        if (Object.keys($registerType).length == 0){
            window.addEventListener('devicemotion', deviceMotionHandler, false);
        }
        $registerType[eventType] = listener;
    }

    export function removeEventListener(eventType:string , listener:Function) {

        delete $registerType[eventType];
        if (Object.keys($registerType).length == 0){
            window.removeEventListener('devicemotion', deviceMotionHandler, false);
        }


    }


    function deviceMotionHandler(eventData) {

        var acceleration = eventData.accelerationIncludingGravity;
        var event:AccelerationEvent = {

            x: acceleration.x ? acceleration.x : 0,
            y: acceleration.y ? acceleration.y : 0,
            z: acceleration.z ? acceleration.z : 0,
            type: null,
            speed: 0

        }

        var listener = $registerType[EVENT_ACCELERATOR];

        if (listener) {
            event.type = EVENT_ACCELERATOR;
            listener(event);
        }


        listener = $registerType[EVENT_SHAKE];
        if (listener) {


            var currentTime = Date.now();
            event.type = EVENT_SHAKE;

            if ($lastShakeTimestamp == 0) {
                $lastShakeTimestamp = currentTime;
                $lastShakeEvent = event;
            }
            var passtime = currentTime - $lastShakeTimestamp;
            if (passtime > 100) {

                var speed = Math.abs(event.x + event.y + event.z - $lastShakeEvent.x - $lastShakeEvent.y - $lastShakeEvent.z) / passtime * 10000
                event.speed = speed;
                $lastShakeEvent = event;
                $lastShakeTimestamp = currentTime;
                listener(event);


            }
        }
    }
}