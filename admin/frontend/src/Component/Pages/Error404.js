import React from "react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const Error404 = () => {
  return (
    <>
      <div class="page">
        <div class="page-content">
          <div class="container text-center">
            <div class="row">
              <div class="col-md-12">
                <div class="">
                  <div class="text-primary">
                    <div class="display-1 mb-5 fw-bold error-text">404</div>
                    <h1 class="h3  mb-3 fw-bold">
                      Sorry, an error has occured, Requested Page not found!
                    </h1>
                    <p class="h5 font-weight-normal mb-7 leading-normal">
                      You may have mistyped the address or the page may have
                      moved.
                    </p>

                 
                    <a
                      // href="https://ttyo.app"
                      href="/admin/mainDashboard"
                      class="btn text-primary border-primary mb-5 ms-2 fs-18"
                    >
                      Back to Home
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Error404;
