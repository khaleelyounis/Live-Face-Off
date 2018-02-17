import React, { Component } from 'react';
import { OTSession, OTPublisher, OTStreams, OTSubscriber } from 'opentok-react';
import '../assets/css/tokbox.css';
import axios from 'axios';
const OT = require('@opentok/client');
const publisher = OT.initPublisher();

class TokBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            connection: 'Connecting',
            publishVideo: true,
            apiKey: '',
            sessionId: '',
            token: '',
        };
        this.sessionEventHandlers = {
            sessionConnected: () => {
                this.setState({ connection: 'Connected' });
            },
            sessionDisconnected: () => {
                this.setState({ connection: 'Disconnected' });
            },
            sessionReconnected: () => {
                this.setState({ connection: 'Reconnected' });
            },
            sessionReconnecting: () => {
                this.setState({ connection: 'Reconnecting' });
            },
        };

        this.publisherEventHandlers = {
            accessDenied: () => {
                console.log('User denied access to media source');
            },
            streamCreated: () => {
                console.log('Publisher stream created');
            },
            streamDestroyed: ({ reason }) => {
                console.log(`Publisher stream destroyed because: ${reason}`);
            },
        };

        this.subscriberEventHandlers = {
            videoEnabled: () => {
                console.log('Subscriber video enabled');
            },
            videoDisabled: () => {
                console.log('Subscriber video disabled');
            },
        };
    }
    onSessionError = error => {
        this.setState({ error });
    };

    onPublish = () => {
        console.log('Publish Success');
    };

    onPublishError = error => {
        this.setState({ error });
    };

    onSubscribe = () => {
        console.log('Subscribe Success');
    };

    onSubscribeError = error => {
        this.setState({ error });
    };

    toggleVideo = () => {
        this.setState({ publishVideo: !this.state.publishVideo });
    };

    getRequest() {
        axios.get('/tokbox/room/room1')
            .then(res => {
                console.log(res.data);
                this.setState({
                    apiKey: res.data.apiKey,
                    sessionId: res.data.sessionId,
                    token: res.data.token
                });
            });
    }
    componentDiDMount() {
        console.log('CDM in progress!');
        this.getRequest();
    }

    render() {
        console.log('openTok State:', this.state);
        const { apiKey, sessionId, token, error, connection, publishVideo } = this.state;
        if (!apiKey) {
            return (
                <h1>Loading...</h1>
            )
        }
        return (
            <div>
                <div>Session Status: {connection}</div>
                {error ? (
                    <div className="error">
                        <strong>Error:</strong> {error}
                    </div>
                ) : null}
                <OTSession
                    apiKey={apiKey}
                    sessionId={sessionId}
                    token={token}
                    onError={this.onSessionError}
                    eventHandlers={this.sessionEventHandlers}
                >
                    <button onClick={this.toggleVideo}>
                        {publishVideo ? 'Disable' : 'Enable'} Video
          </button>
                    <OTPublisher
                        properties={{ publishVideo, width: 50, height: 50, }}
                        onPublish={this.onPublish}
                        onError={this.onPublishError}
                        eventHandlers={this.publisherEventHandlers}
                    />
                    <OTStreams>
                        <OTSubscriber
                            properties={{ width: 100, height: 100 }}
                            onSubscribe={this.onSubscribe}
                            onError={this.onSubscribeError}
                            eventHandlers={this.subscriberEventHandlers}
                        />
                    </OTStreams>
                </OTSession>
            </div>
        );
    }
}

export default TokBox;