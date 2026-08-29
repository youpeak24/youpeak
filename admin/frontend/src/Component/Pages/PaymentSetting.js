import React, { useState } from "react";
import Input from '../extra/Input'
import Selector from '../extra/Selector'
import NewTitle from "../extra/Title";
import { FormControlLabel, Switch } from "@mui/material";
import styled from "@emotion/styled";

export default function PaymentSetting() {
  const [dayAnalytics, setDayAnalytics] = useState("All");

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: "76px",
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      top:"8px",
      transform: "translateX(10px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(40px)",
        top: "8px",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M16.5992 5.06724L16.5992 5.06719C16.396 4.86409 16.1205 4.75 15.8332 4.75C15.546 4.75 15.2705 4.86409 15.0673 5.06719L15.0673 5.06721L7.91657 12.2179L4.93394 9.23531C4.83434 9.13262 4.71537 9.05067 4.58391 8.9942C4.45174 8.93742 4.30959 8.90754 4.16575 8.90629C4.0219 8.90504 3.87925 8.93245 3.74611 8.98692C3.61297 9.04139 3.49202 9.12183 3.3903 9.22355C3.28858 9.32527 3.20814 9.44622 3.15367 9.57936C3.0992 9.7125 3.07179 9.85515 3.07304 9.99899C3.07429 10.1428 3.10417 10.285 3.16095 10.4172C3.21742 10.5486 3.29937 10.6676 3.40205 10.7672L7.15063 14.5158L7.15066 14.5158C7.35381 14.7189 7.62931 14.833 7.91657 14.833C8.20383 14.833 8.47933 14.7189 8.68249 14.5158L8.68251 14.5158L16.5992 6.5991L16.5992 6.59907C16.8023 6.39592 16.9164 6.12042 16.9164 5.83316C16.9164 5.54589 16.8023 5.27039 16.5992 5.06724Z" fill="white" stroke="white" stroke-width="0.5"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: theme.palette === "dark" ? "#8796A5" : "#aab4be",
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: theme.palette === "dark" ? "#0FB515" : "red",
      width: 24,
      height: 24,
      "&:before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14.1665 5.83301L5.83325 14.1663" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M5.83325 5.83301L14.1665 14.1663" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>')`,
      },
    },
    "& .MuiSwitch-track": {
      borderRadius: "52px",
      border: "0.5px solid rgba(0, 0, 0, 0.14)",
      background: " #eff6ff",
      boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.08) inset",
      opacity: 1,
      width: "79px",
      height: "28px",
      borderRadius: "52px",
    },
  }));
  return (
    <div className="payment-setting">
      <div className="dashboardHeader primeHeader mb-3 p-0">
        <NewTitle
          setDayAnalytics={setDayAnalytics}
          dayAnalytics={dayAnalytics}
          dayAnalyticsShow={false}
          name={`Payment Setting`}
        />
      </div>
      <div className="payment-setting-box">
        <h5>Payment Setting</h5>
      <div className="row" style={{padding:"15px"}}>
        <div className="col-6">
        <div className="">
          <div className="withdrawal-box">
            <h6>Withdrawal Setting</h6>
            <div className="withdrawal-requests ">
              <p>Users can send withdrawal requests via any of these methods</p>
            </div>
            <div className="row">
              <div className="col-12 mt-3 d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>Bank Transfer</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
              </div>
              <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>Paypal</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
              </div>
              <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>Skrill</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
              </div>
              <div className="col-12 mt-1 d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>Custom Method</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
              </div>
              <div  className="withdrawal-input">
                 <Input 
                     label={"Minimum Withdrawal request"}
                     name={"userName"}
                     type={"number"}
                     placeholder={"Enter Amount"}
                 />
                 <p>Minimum withdrawal the users can request</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="withdrawal-box payment-box">
            <h6>Payment Setting</h6>
            <div className="row">
              <div className="col-12 mt-1 ">
                <div className="d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>Paypal Payment Method</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
                </div>
                 <p style={{marginTop:"-2px"}}>Enable Paypal to receive payments from ads and pro packages.</p>
              </div>
              <div className="selector-payment-setting">
                  <label>PayPal Currency</label>
                  <p>Set your Paypal currency, this will be used only on PayPal.</p>
                  <Selector
                  label={""}
                  placeholder={"Select Paypal Currency"}
                  selectData={["USD","IND","EURO"]}
                />
                </div>
                <div className="selector-payment-setting">
                  <label>PayPal Mode</label>
                  <p>Set your Paypal currency, this will be used only on PayPal.</p>
                  <Selector
                  label={""}
                  placeholder={"Select Paypal Mode"}
                  selectData={["USD","IND","EURO"]}
                />
                </div>
              <div  className="withdrawal-input">
                 <Input 
                     label={"PayPal Client ID"}
                     name={"paypalClientId"}
                     type={"number"}
                     placeholder={""}
                 />
                 <p >Choose the mode your application is using, for testing use the SandBox mode.</p>
              </div>
            </div>
          </div>
        </div>
          </div>
        <div className="col-6">
          <div className="withdrawal-box payment-box payment-method" style={{height:"100%",maxHeight:"850px"}}>
            <h6>Payment Setting</h6>
            <div className="row">
              <div className="col-12 mt-1 ">
                <div className="d-flex justify-content-between align-items-center">
                <button className="payment-content-button">
                  <span>2Checkout Payment Method</span>
                </button>
                <FormControlLabel
                  control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                />
                </div>
                 <p style={{marginTop:"-2px"}}>Enable 2Checkout to receive payments by credit cards.</p>
              </div>
              <div className="selector-payment-setting">
                  <label>2Checkout Mode</label>
                  <p>Choose the mode your application is using, for testing use the SandBox mode.</p>
                  <Selector
                  label={""}
                  placeholder={"Select..."}
                  selectData={["USD","IND","EURO"]}
                />
                </div>
                <div className="selector-payment-setting">
                  <label>2Checkout Currency</label>
                  <p>Set your 2Checkout currency, this will be used only on 2checkout.</p>
                  <Selector
                  label={""}
                  placeholder={"Select..."}
                  selectData={["USD","IND","EURO"]}
                />
                </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
