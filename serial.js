var apc = require('os').networkInterfaces()
var fs = require('fs');

var mac = apc.apcli0[0].mac
var SerialPort = require("serialport").SerialPort
    // var serialPort = new SerialPort("/dev/ttyS0", {
    //     baudrate: 19200
    // });

//var mac = apc.en1[0].mac

var command = []
var HD = new Buffer('BA69', 'hex')
var x = new Buffer('AA', 'hex')
var processTask = null

console.log(mac + " start")
var mqtt = require('mqtt');

var init = false
var setting = {}
var taskId = {}

if (!fs.existsSync(__dirname + '/disconnect')) {
    fs.mkdirSync(__dirname + '/disconnect')
}




console.log('open serial')
var serialPort = new SerialPort("/dev/ttyS0", {
    baudrate: 19200
})

var serialMode = null
var game_start = false
var game_finish = false
var dataSetting = {
    status: null,
    coin: null,
    output: null,
    second: null,
    result: null,
    mtype: null
}
var callback = null


serialPort.on('data', function(data) {
    if (serialMode === 'setting') {
        if (data.length === 9) {
            if (data[0] === 0xa9 && data[1] === 0xe7) {

                if (data[2] === 0x10 && data[3] === 0x01) {
                    dataSetting.coin = data.readUInt16BE(4)
                    dataSetting.status = data.readUInt8(7)
                    setting.status = dataSetting.status
                    setting.coin = dataSetting.coin
                    console.log('coin and status get');
                } else if (data[2] === 0x03 && data[3] === 0x03) {
                    dataSetting.output = data.readUInt16BE(4)
                    setting.output = dataSetting.output
                    console.log('output get');
                } else if (data[2] === 0x11 && data[3] === 0x01) {
                    dataSetting.result = data.readUInt8(4)
                    setting.result = dataSetting.result
                    console.log('result get');
                } else if (data[2] === 0xB1 && data[3] === 0x03) {
                    dataSetting.second = data.readUInt8(4)
                    setting.result = dataSetting.second
                    console.log('second get');
                } else if (data[2] === 0x01 && data[3] === 0x01) {
                    dataSetting.mtype = data.readUInt8(6)
                    setting.mtype = dataSetting.mtype
                    console.log('mtype get');
                } else {
                    console.log('data isnt ok');
                }
            } else {
                console.log("result data's header is not correct")
            }
        }
        if (dataSetting.status != null && dataSetting.coin != null && dataSetting.output != null & dataSetting.second != null && dataSetting.mtype != null && dataSetting.result != null) {
            callback(null, { status: dataSetting.status, coin: dataSetting.coin, output: dataSetting.output, second: dataSetting.second, result: dataSetting.result, mtype: dataSetting.mtype })
        }
    } else if (serialMode === 'startGame') {
        if (data.length === 9) {
            if (data[0] === 0xa9 && data[1] === 0xe7) {
                if (data[2] === 0x01 && data[3] === 0x01) {
                    console.log('Game start receive')
                    game_start = true
                } else if (data[2] === 0x10 && data[3] === 0x01) {
                    dataSetting.status = data.readUInt8(7)
                    dataSetting.coin = data.readUInt16BE(4)
                    setting.status = dataSetting.status
                    console.log('status change:' + dataSetting.status)
                    if (dataSetting.status >= 0x10 && dataSetting.status <= 0x15) {
                        console.log('Game start receive from status')
                        game_start = true
                    } else if (dataSetting.status >= 0x1a && dataSetting.status <= 0x1b) {
                        if (!game_finish) {
                            game_finish = true
                            
                            var A3 = new Buffer('10', 'hex')
                            var A4 = new Buffer('01', 'hex')
                            var A5 = new Buffer('00', 'hex')
                            var A6 = new Buffer('00', 'hex')
                            var A7 = new Buffer('00', 'hex')
                            var A8 = new Buffer('00', 'hex')
                            var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                            var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                            serialPort.write(CMD)

                            setTimeout(function() {
                                var A3 = new Buffer('03', 'hex')
                                var A4 = new Buffer('03', 'hex')
                                var A5 = new Buffer('00', 'hex')
                                var A6 = new Buffer('00', 'hex')
                                var A7 = new Buffer('00', 'hex')
                                var A8 = new Buffer('00', 'hex')
                                var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                                var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                                serialPort.write(CMD)
                            }, 100)
                            setTimeout(function() {
                                var A3 = new Buffer('11', 'hex')
                                var A4 = new Buffer('01', 'hex')
                                var A5 = new Buffer('00', 'hex')
                                var A6 = new Buffer('00', 'hex')
                                var A7 = new Buffer('00', 'hex')
                                var A8 = new Buffer('00', 'hex')
                                var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                                var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                                serialPort.write(CMD)
                            }, 200)
                        }


                    } else if (dataSetting.status === 0x01) {
                        if (game_start) {
                            if (!game_finish) {
                                game_finish = true

                                var A3 = new Buffer('10', 'hex')
                                var A4 = new Buffer('01', 'hex')
                                var A5 = new Buffer('00', 'hex')
                                var A6 = new Buffer('00', 'hex')
                                var A7 = new Buffer('00', 'hex')
                                var A8 = new Buffer('00', 'hex')
                                var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                                var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                                serialPort.write(CMD)

                                setTimeout(function() {
                                    var A3 = new Buffer('03', 'hex')
                                    var A4 = new Buffer('03', 'hex')
                                    var A5 = new Buffer('00', 'hex')
                                    var A6 = new Buffer('00', 'hex')
                                    var A7 = new Buffer('00', 'hex')
                                    var A8 = new Buffer('00', 'hex')
                                    var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                                    var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                                    serialPort.write(CMD)
                                }, 100)
                                setTimeout(function() {
                                    var A3 = new Buffer('11', 'hex')
                                    var A4 = new Buffer('01', 'hex')
                                    var A5 = new Buffer('00', 'hex')
                                    var A6 = new Buffer('00', 'hex')
                                    var A7 = new Buffer('00', 'hex')
                                    var A8 = new Buffer('00', 'hex')
                                    var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
                                    var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
                                    serialPort.write(CMD)
                                }, 200)
                            }

                        } else {
                            callback('Machine status error ' + status)
                        }

                    } else if (dataSetting.status === 0xAA) {
                        callback('Machine failed')
                    }
                } else if (data[2] === 0x03 && data[3] === 0x03) {
                    dataSetting.output = data.readUInt16BE(4)
                    setting.output = output
                    console.log('output get');
                } else if (data[2] === 0x11 && data[3] === 0x01) {
                    dataSetting.result = data.readUInt8(4)
                    setting.result = result
                    console.log('result get');
                }
                if (dataSetting.status != null && dataSetting.coin != null && dataSetting.output != null & dataSetting.result != null) {
                    callback(null, { status: dataSetting.status, coin: dataSetting.coin, output: dataSetting.output, result: dataSetting.result })
                }
            }
        } else {
            console.log("result data's header is not correct")
        }

    }
})

GetSetting = function(cb) {
    dataSetting = {
        status: null,
        coin: null,
        output: null,
        second: null,
        result: null,
        mtype: null
    }
    serialMode = 'setting'
    callback = cb
    var A3 = new Buffer('10', 'hex')
    var A4 = new Buffer('01', 'hex')
    var A5 = new Buffer('00', 'hex')
    var A6 = new Buffer('00', 'hex')
    var A7 = new Buffer('00', 'hex')
    var A8 = new Buffer('00', 'hex')
    var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
    var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
    serialPort.write(CMD)

    setTimeout(function() {
        var A3 = new Buffer('03', 'hex')
        var A4 = new Buffer('03', 'hex')
        var A5 = new Buffer('00', 'hex')
        var A6 = new Buffer('00', 'hex')
        var A7 = new Buffer('00', 'hex')
        var A8 = new Buffer('00', 'hex')
        var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
        var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
        serialPort.write(CMD)
    }, 100)
    setTimeout(function() {
        var A3 = new Buffer('11', 'hex')
        var A4 = new Buffer('01', 'hex')
        var A5 = new Buffer('00', 'hex')
        var A6 = new Buffer('00', 'hex')
        var A7 = new Buffer('00', 'hex')
        var A8 = new Buffer('00', 'hex')
        var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
        var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
        serialPort.write(CMD)
    }, 200)
    setTimeout(function() {
        A3 = new Buffer('B1', 'hex')
        A4 = new Buffer('03', 'hex')
        A5 = new Buffer('00', 'hex')
        A6 = new Buffer('00', 'hex')
        A7 = new Buffer('00', 'hex')
        A8 = new Buffer('00', 'hex')
        A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
        CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
        serialPort.write(CMD)
    }, 300)
    setTimeout(function() {
        A3 = new Buffer('A0', 'hex')
        A4 = new Buffer('00', 'hex')
        A5 = new Buffer('00', 'hex')
        A6 = new Buffer('00', 'hex')
        A7 = new Buffer('00', 'hex')
        A8 = new Buffer('00', 'hex')
        A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
        CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
        serialPort.write(CMD)
    }, 400)
}
startGame = function(cb) {
    dataSetting = {
        status: null,
        coin: null,
        output: null,
        second: null,
        result: null,
        mtype: null
    }
    game_start = false
    game_finish = false
    callback = cb
    var A3 = new Buffer('0B', 'hex')
    var A4 = new Buffer('01', 'hex')
    var A5 = new Buffer('01', 'hex')
    var A6 = new Buffer('00', 'hex')
    var A7 = new Buffer('00', 'hex')
    var A8 = new Buffer('00', 'hex')
    var A9 = xor(xor(xor(xor(xor(xor(A3, A4), A5), A6), A7), A8), x);
    var CMD = Buffer.concat([HD, A3, A4, A5, A6, A7, A8, A9])
    serialPort.write(CMD)
    setTimeout(function() {
        if (game_start == false) {
            serialPort.write(CMD)
            setTimeout(function() {
                if (game_start == false) {
                    cb("Game doesn't start")
                }
            }, 3000)
        }
    }, 3000)



}

function xor(a, b) {
    var length = Math.max(a.length, b.length)
    var buffer = new Buffer(length)

    for (var i = 0; i < length; ++i) {
        buffer[i] = a[i] ^ b[i]
    }
    return buffer
}
console.log('mqtt start')
var client = mqtt.connect('mqtt://220.135.202.42', {
    protocolId: 'MQIsdp',
    protocolVersion: 3
});
serialPort.on('open', function() {
    console.log('open success serial')
    GetSetting(function(error, s) {
        setting = {
            init: false,
            status: s.status,
            coin: s.coin,
            output: s.output,
            second: s.second,
            mtype: s.mtype
        }
        console.log('init:' + JSON.stringify(setting))
        client.on('connect', function() {
            console.log('connected')
            setting.init = false
            console.log('Start A Process')
            client.subscribe(mac + '_R');
            client.publish("Config", JSON.stringify({ type: setting.mtype, mac: mac }));
            console.log('A1 - Send Config:' + JSON.stringify({ type: setting.mtype, mac: mac }))
        });
        if (client.connected) {
            console.log('connected')
            setting.init = false
            console.log('Start A Process')
            client.subscribe(mac + '_R');
            client.publish("Config", JSON.stringify({ type: setting.mtype, mac: mac }));
            console.log('A1 - Send Config:' + JSON.stringify({ type: setting.mtype, mac: mac }))
        }
        client.on('message', function(topic, message) {
            var result = JSON.parse(message)
            command.push(result)
            console.log(message.toString());
        });
        client.on('reconnect', function() {
            console.log('reconnect')

        })
        client.on('offline', function() {

            console.log('offline')
        })
        client.on('close', function() {
            setting.init = false
            console.log('disconnect')
        })
        client.on('error', function() {
            console.dir(arguments)
        })
        console.log('set login interval')
        setInterval(function() {
            console.log('login job')
            if (client.connected && !setting.init) {
                console.log('Start A Process')
                client.publish("Config", JSON.stringify({ type: setting.mtype, mac: mac }));
                console.log('A1 - Send Config:' + JSON.stringify({ type: setting.mtype, mac: mac }))
            }
        }, 4000)
        console.log('set query interval')
        setInterval(function() {
            console.log('query job')
            if (!command[0] && !processTask) {
                return
            } else if (!command[0]) {
                var diff = Math.abs(new Date() - processTask.processDate);
                var sec = Math.floor((diff / 1000));
                if (sec > processTask.timeout) {
                    processTask = null
                    serilaMode = null
                    callback = null
                } else {
                    return
                }
            } else {
                serilaMode = null
                callback = null
                processTask = {
                    task: command.pop(),
                    processDate: new Date()
                }
            }
            result = processTask.task
            if (result.cmd === 'G') {
                console.log('A2 - Get G:' + JSON.stringify(result))
                processTask.timeout = 2
                GetSetting(function(error, setting) {
                    if (!error) {
                        var r = JSON.stringify({
                            cmd: 'H',
                            status: setting.status,
                            coin: setting.coin,
                            output: setting.output,
                            second: setting.second,
                            taskId: processTask.task.taskId
                        })
                        client.publish(mac + '_T', r);
                        console.log('A3 - Send T:' + r)
                        setting.init = true
                        processTask = null
                    } else {
                        console.log('H: get Setting error' + r)
                    }
                })
            } else if (result.cmd === "C") {
                console.log('Start B Process')
                processTask.timeout = 2
                GetSetting(function(error, setting) {
                    if (!error) {
                        var r = JSON.stringify({
                            cmd: 'I',
                            status: setting.status,
                            coin: setting.coin,
                            output: setting.output,
                            taskId: processTask.task.taskId
                        })
                        client.publish(mac + '_T', r);
                        console.log('B1 - Send I:' + r)
                        processTask = null
                    } else {
                        console.log('I: get Setting error' + r)
                    }
                })
            } else if (result.cmd === "J") {
                console.log('B4 - J task return ' + result.taskId)
                if (taskId[result.taskId]) {
                    delete taskId[result.taskId]
                }
                if (fs.existsSync(__dirname + '/disconnect/' + result.taskId)) {
                    fs.unlink(__dirname + '/disconnect/' + result.taskId)
                }
                processTask = null
            } else if (result.cmd === "D") {

                console.log('B2 - Get D:' + JSON.stringify(result))
                process.timeout = 60
                startGame(function(error, setting) {
                    var success = true
                    if (error) {
                        success = false
                    }

                    if (!error) {
                        var r = JSON.stringify({
                            cmd: 'E',
                            status: setting.status,
                            coin: setting.coin,
                            output: setting.output,
                            taskId: processTask.task.taskId,
                            result: setting.result
                        })
                        console.log('B3 - Send E:' + r)
                        if (setting.init) {
                            setTimeout(function() {
                                if (taskId[processTask.task.taskId]) {
                                    console.log('B3 - J not return, Backup E Unsend ' + processTask.task.taskId)
                                    fs.writeFileSync(__dirname + '/disconnect/' + processTask.task.taskId, r)
                                }
                            }, 4000)
                            client.publish(mac + '_T', r);
                            taskId[processTask.task.taskId] = true
                        } else {
                            console.log('B3 - init failed, Backup E Unsend ' + processTask.task.taskId)
                            fs.writeFileSync(__dirname + '/disconnect/' + processTask.task.taskId, r)
                        }
                    }else{
                        console.log(error)
                    }

                })
            }

            if (setting.init && client.connected) {
                var files = fs.readdirSync(__dirname + '/disconnect');
                if (files.length > 0) {
                    console.log('B3 - Resent E:' + files[0])
                    client.publish(mac + '_T', fs.readFileSync(__dirname + '/disconnect/' + files[0]));
                }
            }
        }, 500)
    })






})
