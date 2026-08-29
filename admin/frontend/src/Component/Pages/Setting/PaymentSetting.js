import React, { useEffect, useState } from "react";
import Input from "../../extra/Input";
import Selector from "../../extra/Selector";
import NewTitle from "../../extra/Title";
import {
  getSettingApi,
  editSetting,
  getWithdrawalApi,
} from "../../store/setting/setting.action";
import { FormControlLabel, Switch } from "@mui/material";
import styled from "@emotion/styled";
import { connect, useDispatch, useSelector } from "react-redux";
import Button from "../../extra/Button";
import { Skeleton } from "@mui/material";

import PaymentRestrictionsDialog from "../../dialogue/PaymentRestrictionsDialog";
import { cashfreeContent, flutterWaveContent, googlePlayContent, paypalContent, paystackContent, razorpayContent, stripeContent } from "../../extra/infoContent";
import InfoTooltip from "../../extra/InfoTooltip";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: "76px",
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    top: "8px",
    transform: "translateX(10px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(38px)",
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
    width: "60px",
    height: "28px",
    borderRadius: "52px",
  },
}));

function PaymentSetting(props) {
  const { settingData, withdrawData } = useSelector((state) => state.setting);
  const { isLoading } = useSelector((state) => state.dialogue);

  const dispatch = useDispatch();
  const [data, setData] = useState();
  const [originalData, setOriginalData] = useState({});
  const [stripePublishableKey, setStripePublishableKey] = useState();
  const [stripeSecretKey, setStripeSecretKey] = useState();
  const [razorPayId, setRazorPayId] = useState();
  const [razorSecretKey, setRazorSecretKey] = useState();
  const [stripeSwitch, setStripeSwitch] = useState();
  const [stripeIosSwitch, setStripeIosSwitch] = useState();
  const [stripeWebEnabled, setStripeWebEnabled] = useState();
  const [razorPaySwitch, setRazorPaySwitch] = useState();
  const [razorPayIosSwitch, setRazorPayIosSwitch] = useState();
  const [razorpayWebEnabled, setRazorpayWebEnabled] = useState();
  const [bankTransfer, setBankTransfer] = useState();
  const [customMethod, setCustomMethod] = useState();
  const [payPal, setPayPal] = useState();
  const [skrill, setSkrill] = useState();
  const [googlePlaySwitch, setGooglePlaySwitch] = useState();
  const [googlePlayIosSwitch, setGooglePlayIosSwitch] = useState();
  const [minWithdrawalRequest, setMinWithdrawalRequest] = useState();
  const [customMethodText, setCustomMethodText] = useState();
  const [withdrawDataName, setWithdrawDataName] = useState([]);

  const [flutterWaveId, setFlutterWaveId] = useState();
  const [flutterWaveSwitch, setFlutterWaveSwitch] = useState();
  const [flutterWaveIosSwitch, setFlutterWaveIosSwitch] = useState();
  const [flutterwaveWebEnabled, setFlutterwaveWebEnabled] = useState();

  const [paystackAndroidEnabled, setPaystackAndroidEnabled] = useState();
  const [paystackIosEnabled, setPaystackIosEnabled] = useState();
  const [paystackWebEnabled, setPaystackWebEnabled] = useState();

  const [cashfreeAndroidEnabled, setCashfreeAndroidEnabled] = useState();
  const [cashfreeIosEnabled, setCashfreeIosEnabled] = useState();
  const [cashfreeWebEnabled, setCashfreeWebEnabled] = useState();

  const [paypalAndroidEnabled, setPaypalAndroidEnabled] = useState();
  const [paypalIosEnabled, setPaypalIosEnabled] = useState();
  const [paypalWebEnabled, setPaypalWebEnabled] = useState();

  const [paystackPublicKey, setPaystackPublicKey] = useState();
  const [paystackSecretKey, setPaystackSecretKey] = useState();
  const [cashfreeClientId, setCashfreeClientId] = useState();
  const [cashfreeClientSecret, setCashfreeClientSecret] = useState();
  const [paypalClientId, setPaypalClientId] = useState();
  const [paypalSecretKey, setPaypalSecretKey] = useState();

  const [error, setError] = useState({
    razorPayId: "",
    razorSecretKey: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    minWithdrawalRequest: "",
    customMethodText: "",
    paystackPublicKey: "",
    paystackSecretKey: "",
    cashfreeClientId: "",
    cashfreeClientSecret: "",
    paypalClientId: "",
    paypalSecretKey: "",
    flutterWaveId: "",
  });

  const [paymentRestrictionOpen, setPaymentRestrictionOpen] = useState(false);

  const openPaymentRestriction = () => {
    setPaymentRestrictionOpen(true);
  };

  useEffect(() => {
    dispatch(getSettingApi());

  }, [dispatch]);

  useEffect(() => {
    setData(settingData);
  }, [settingData]);

  useEffect(() => {
    const filterData = withdrawData?.filter((item) => item?.isEnabled === true);

    const getNameWithdrawData = filterData?.map(
      (item) => " " + item?.name + " "
    );
    setWithdrawDataName(getNameWithdrawData);
  }, [withdrawData]);

  useEffect(() => {
    setRazorPayId(settingData?.razorPayId);
    setRazorSecretKey(settingData?.razorSecretKey);
    setRazorPaySwitch(settingData?.razorPaySwitch);
    setRazorPayIosSwitch(settingData?.razorpayIosEnabled);
    setRazorpayWebEnabled(settingData?.razorpayWebEnabled);
    setStripeSwitch(settingData?.stripeSwitch);
    setStripeIosSwitch(settingData?.stripeIosEnabled);
    setStripeWebEnabled(settingData?.stripeWebEnabled);
    setStripePublishableKey(settingData?.stripePublishableKey);
    setStripeSecretKey(settingData?.stripeSecretKey);
    setBankTransfer(settingData?.bankTransfer);
    setCustomMethod(settingData?.customMethod);
    setPayPal(settingData?.payPal);
    setSkrill(settingData?.skrill);
    setGooglePlaySwitch(settingData?.googlePlaySwitch);
    setGooglePlayIosSwitch(settingData?.googlePayIosEnabled);
    setMinWithdrawalRequest(settingData?.minWithdrawalRequest);
    setFlutterWaveId(settingData?.flutterWaveId);
    setFlutterWaveSwitch(settingData?.flutterWaveSwitch);
    setFlutterWaveIosSwitch(settingData?.flutterwaveIosEnabled);
    setFlutterwaveWebEnabled(settingData?.flutterwaveWebEnabled);
    setPaystackAndroidEnabled(settingData?.paystackAndroidEnabled);
    setPaystackIosEnabled(settingData?.paystackIosEnabled);
    setPaystackWebEnabled(settingData?.paystackWebEnabled);
    setCashfreeAndroidEnabled(settingData?.cashfreeAndroidEnabled);
    setCashfreeIosEnabled(settingData?.cashfreeIosEnabled);
    setCashfreeWebEnabled(settingData?.cashfreeWebEnabled);
    setPaypalAndroidEnabled(settingData?.paypalAndroidEnabled);
    setPaypalIosEnabled(settingData?.paypalIosEnabled);
    setPaypalWebEnabled(settingData?.paypalWebEnabled);
    setPaystackPublicKey(settingData?.paystackPublicKey);
    setPaystackSecretKey(settingData?.paystackSecretKey);
    setCashfreeClientId(settingData?.cashfreeClientId);
    setCashfreeClientSecret(settingData?.cashfreeClientSecret);
    setPaypalClientId(settingData?.paypalClientId);
    setPaypalSecretKey(settingData?.paypalSecretKey);

    // Set original data for comparison

    setOriginalData({
      razorPayId: settingData?.razorPayId,
      razorSecretKey: settingData?.razorSecretKey,
      stripePublishableKey: settingData?.stripePublishableKey,
      stripeSecretKey: settingData?.stripeSecretKey,
      minWithdrawalRequest: settingData?.minWithdrawalRequest,
      flutterWaveId: settingData?.flutterWaveId,
      paystackPublicKey: settingData?.paystackPublicKey,
      paystackSecretKey: settingData?.paystackSecretKey,
      cashfreeClientId: settingData?.cashfreeClientId,
      cashfreeClientSecret: settingData?.cashfreeClientSecret,
      paypalClientId: settingData?.paypalClientId,
      paypalSecretKey: settingData?.paypalSecretKey,

    })

  }, [settingData]);

  const handleSubmit = () => {
    openPaymentRestriction();
  };

  useEffect(() => {
    if (props.submitTrigger > 0) {
      handleSubmit();
    }
  }, [props.submitTrigger]);

  const handleChange = () => {
    openPaymentRestriction();
  };

  return (
    <div className="payment-setting p-0 mainSetting">
      <PaymentRestrictionsDialog
        open={paymentRestrictionOpen}
        onClose={() => setPaymentRestrictionOpen(false)}
      />
      <div className="settingBox row g-3">
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">Razor Pay Payment Setting</h4>
              <InfoTooltip title="Razorpay Setting" content={razorpayContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Razor Pay Android Switch (enable/disable for payment in app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={razorPaySwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Razor Pay iOS Switch (enable/disable for payment in app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={razorPayIosSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Razor Pay Web Switch (enable/disable for payment in web)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={razorpayWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Razor Pay Id"}
                    name={"razorPayId"}
                    type={"text"}
                    loading={isLoading}
                    value={razorPayId}
                    errorMessage={error.razorPayId && error.razorPayId}
                    placeholder={" Enter Details..."}
                    onChange={openPaymentRestriction}
                  />
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Razor Secret Key"}
                    name={"durationOfShorts"}
                    type={"text"}
                    loading={isLoading}
                    value={razorSecretKey}
                    errorMessage={error.razorSecretKey && error.razorSecretKey}
                    placeholder={" Enter Details..."}
                    onChange={openPaymentRestriction}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">Stripe Payment Setting</h4>
              <InfoTooltip title="Stripe Payment Setting" content={stripeContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">
                <div className="col-12 d-flex justify-content-between align-items-center ">
                  <button className="payment-content-button">
                    <span>Stripe Android Switch (enable/disable for payment in app)</span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={stripeSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center ">
                  <button className="payment-content-button">
                    <span>Stripe iOS Switch (enable/disable for payment in app)</span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={stripeIosSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center ">
                  <button className="payment-content-button">
                    <span>Stripe Web Switch (enable/disable for payment in web)</span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={stripeWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Stripe Publishable Key"}
                    name={"stripePublishableKey"}
                    type={"text"}
                    loading={isLoading}
                    value={stripePublishableKey}
                    errorMessage={
                      error.stripePublishableKey && error.stripePublishableKey
                    }
                    placeholder={" Enter Details..."}
                    onChange={openPaymentRestriction}
                  />
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Stripe Secret Key"}
                    name={"stripeSecretKey"}
                    type={"text"}
                    loading={isLoading}
                    value={stripeSecretKey}
                    errorMessage={
                      error.stripeSecretKey && error.stripeSecretKey
                    }
                    placeholder={"Enter Details..."}
                    onChange={openPaymentRestriction}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">Paystack Setting</h4>
              <InfoTooltip title="Paystack Setting" content={paystackContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Paystack Android Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paystackAndroidEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Paystack iOS Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paystackIosEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Paystack Web Switch (enable/disable for payment in
                      web)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paystackWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Paystack Public Key"}
                    name={"paystackPublicKey"}
                    type={"text"}
                    loading={isLoading}
                    value={paystackPublicKey}
                    errorMessage={
                      error.paystackPublicKey && error.paystackPublicKey
                    }
                    placeholder={"Enter Paystack Public Key"}
                    onChange={openPaymentRestriction}
                  />
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Paystack Secret Key"}
                    name={"paystackSecretKey"}
                    type={"text"}
                    loading={isLoading}
                    value={paystackSecretKey}
                    errorMessage={
                      error.paystackSecretKey && error.paystackSecretKey
                    }
                    placeholder={"Enter Paystack Secret Key"}
                    onChange={openPaymentRestriction}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">Cashfree Setting</h4>
              <InfoTooltip title="Cashfree Setting" content={cashfreeContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Cashfree Android Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={cashfreeAndroidEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Cashfree iOS Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={cashfreeIosEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      Cashfree Web Switch (enable/disable for payment in
                      web)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={cashfreeWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Cashfree Client Id"}
                    name={"cashfreeClientId"}
                    type={"text"}
                    loading={isLoading}
                    value={cashfreeClientId}
                    errorMessage={
                      error.cashfreeClientId && error.cashfreeClientId
                    }
                    placeholder={"Enter Cashfree Client Id"}
                    onChange={openPaymentRestriction}
                  />
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Cashfree Secret Key"}
                    name={"cashfreeClientSecret"}
                    type={"text"}
                    loading={isLoading}
                    value={cashfreeClientSecret}
                    errorMessage={
                      error.cashfreeClientSecret && error.cashfreeClientSecret
                    }
                    placeholder={"Enter Cashfree Client Secret"}
                    onChange={openPaymentRestriction}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">PayPal Setting</h4>
              <InfoTooltip title="PayPal Setting" content={paypalContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      PayPal Android Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paypalAndroidEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      PayPal iOS Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paypalIosEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      PayPal Web Switch (enable/disable for payment in
                      web)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={paypalWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"PayPal Client Id"}
                    name={"payPalClientId"}
                    type={"text"}
                    loading={isLoading}
                    value={paypalClientId}
                    errorMessage={
                      error.paypalClientId && error.paypalClientId
                    }
                    placeholder={"Enter PayPal Client Id"}
                    onChange={openPaymentRestriction}
                  />
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"PayPal Secret Key"}
                    name={"paypalSecretKey"}
                    type={"text"}
                    loading={isLoading}
                    value={paypalSecretKey}
                    errorMessage={
                      error.paypalSecretKey && error.paypalSecretKey
                    }
                    placeholder={"Enter PayPal Secret Key"}
                    onChange={openPaymentRestriction}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">Flutter Wave Setting</h4>
              <InfoTooltip title="Flutter Wave Setting" content={flutterWaveContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      FlutterWave Android Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={flutterWaveSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      FlutterWave iOS Switch (enable/disable for payment in
                      app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={flutterWaveIosSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      FlutterWave Web Switch (enable/disable for payment in
                      web)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={flutterwaveWebEnabled}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className="col-12 withdrawal-input">
                  <Input
                    label={"Flutter Wave Id"}
                    name={"flutterWaveId"}
                    type={"text"}
                    loading={isLoading}
                    value={flutterWaveId}
                    errorMessage={
                      error.flutterWaveId && error.flutterWaveId
                    }
                    placeholder={"Enter Details..."}
                    onChange={openPaymentRestriction}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="settingBoxOuter">
            <div className="settingBoxHeader d-flex justify-content-between align-items-center px-2">
              <h4 className="settingboxheader">GooglePlay Setting</h4>
              <InfoTooltip title="GooglePlay Setting" content={googlePlayContent} />
            </div>

            <div className="setting-box-body">
              <div className="row withdrawal-input">

                <div className="d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      GooglePlay Android Switch (enable/disable for payment in app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={googlePlaySwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
                <div className=" d-flex justify-content-between align-items-center">
                  <button className="payment-content-button">
                    <span>
                      GooglePlay iOS Switch (enable/disable for payment in app)
                    </span>
                  </button>
                  {isLoading ? (
                    <Skeleton variant="rectangular" width="60px" height={28} style={{ borderRadius: '52px' }} />
                  ) : (
                    <FormControlLabel
                      control={
                        <MaterialUISwitch
                          sx={{ m: 1 }}
                          checked={googlePlayIosSwitch}
                          onChange={() => handleChange()}
                        />
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default connect(null, {
  getSettingApi,
  editSetting,
  getWithdrawalApi,
})(PaymentSetting);
