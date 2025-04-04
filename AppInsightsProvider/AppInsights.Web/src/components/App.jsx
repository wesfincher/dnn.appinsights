import React, {Component} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {PersonaBarPage, PersonaBarPageHeader, PersonaBarPageBody, Button, SingleLineInputWithError, Label, Switch} from "@dnnsoftware/dnn-react-common";
import resx from "../resources";
import util from "../utils";
import {
    settings as SettingsActions
} from "../actions";

import "./style.less";

class App extends Component {

    constructor() {
        super();

        this.state = {
            settingsLoaded: false,
            enabled: false,
            connectionString: "",
            clientModified: false,
            error: {
                connectionString: false
            },
            triedToSubmit: false
        };
    }

    UNSAFE_componentWillMount() {
        const {props} = this;

        if (props.settingsLoaded) {
            this.setState({
                enabled: props.enabled,
                connectionString: props.connectionString,
                clientModified: props.clientModified
            });
            return;
        }

        props.dispatch(SettingsActions.getSettings((data) => {
            this.setState({
                enabled: data.enabled,
                connectionString: data.connectionString
            });
        }));        
    }

    UNSAFE_componentWillReceiveProps(props) {
        this.setState({
            enabled: props.enabled,
            connectionString: props.connectionString,
            clientModified: props.clientModified,
            triedToSubmit: false
        });
    }    

    onSettingChange(key, event) {
        let {state, props} = this;

        if (key === "Enabled") {
            state.enabled = !state.enabled;
        }
        if (key === "ConnectionString") {
            state.connectionString = event.target.value;
        }

        //let pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;            
        //state.error["connectionString"] = state.enabled && !pattern.test(state.connectionString);

        this.setState({
            enabled: state.enabled,
            connectionString: state.connectionString,
            error: state.error,
            clientModified: true,
            triedToSubmit: false
        });

        props.dispatch(SettingsActions.settingsClientModified({
            enabled: state.enabled,
            connectionString: state.connectionString            
        }));
    }

    onCancel() {
        const {props} = this;
        util.utilities.confirm(resx.get("SettingsRestoreWarning"), resx.get("Yes"), resx.get("No"), () => {
            props.dispatch(SettingsActions.getSettings((data) => {
                this.setState({
                    enabled: data.enabled,
                    connectionString: data.connectionString,
                    clientModified: false,
                    error: {
                        connectionString: false
                    }               
                });
            }));
        });        
    }

    onUpdate() {
        event.preventDefault();
        const {props, state} = this;

        if (state.error.connectionString)
            return;

        this.setState({
            triedToSubmit: true
        });

        props.dispatch(SettingsActions.updateSettings({
            enabled: state.enabled,
            connectionString: state.connectionString
        }, () => {
            util.utilities.notify(resx.get("SettingsUpdateSuccess"));
            this.setState({
                clientModified: false
            });            
        }, () => {
            util.utilities.notifyError(resx.get("SettingsError"));
        }));
    }
    render() {
        const {state} = this;
        return (
            <div id="ApplicationInsightsAppContainer">
                <PersonaBarPage isOpen="true">
                    <PersonaBarPageHeader title="Application Insights">
                    </PersonaBarPageHeader>
                    <PersonaBarPageBody>
                        <h1>General settings</h1>
                        <div className="app-insights-performance" />
                        <p>In order to setup Visual Studio Application Insights monitoring, you must first provision an AppInsights account to obtain the Connection String. <a href="https://azure.microsoft.com/en-us/services/application-insights/" target="_new">Get started with Application Insights</a>.</p>

                        <div className="editor-row">
                            <Label label={resx.get("plEnabled") } style={{ fontWeight: "bold" }}/>
                            <div className="left">
                                <Switch labelHidden={true}
                                    value={state.enabled }
                                    onChange={this.onSettingChange.bind(this, "Enabled") } />
                            </div>
                        </div>
                        <div className="editor-row">
                            <SingleLineInputWithError
                                withLabel={true}
                                label={resx.get("plConnectionString") }
                                enabled={state.enabled}
                                error={this.state.error.connectionString}
                                errorMessage={resx.get("ConnectionStringRequired")}
                                value={state.connectionString || ""}
                                onChange={this.onSettingChange.bind(this, "ConnectionString") } />
                        </div>

                        <div className="buttons-box">
                            <Button
                                disabled={!state.clientModified}
                                type="secondary"
                                onClick={this.onCancel.bind(this) }>
                                {resx.get("Cancel") }
                            </Button>
                            <Button
                                disabled={!state.clientModified || state.error.connectionString}
                                type="primary"
                                onClick={this.onUpdate.bind(this) }>
                                {resx.get("Update")}
                            </Button>
                        </div>
                    </PersonaBarPageBody>
                </PersonaBarPage>
            </div>
        );
    }
}

App.PropTypes = {
    dispatch: PropTypes.func.isRequired,
    enabled: PropTypes.bool,
    connectionString: PropTypes.string,
    clientModified: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        enabled: state.enabled,
        connectionString: state.connectionString,
        clientModified: state.clientModified
    };
}

export default connect(mapStateToProps)(App);