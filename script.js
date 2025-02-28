let url_to_head = (url) => {
  return new Promise(function (resolve, reject) {
    var script = document.createElement("script");
    script.src = url;
    script.onload = function () {
      resolve();
    };
    script.onerror = function () {
      reject("Error loading script.");
    };
    document.head.appendChild(script);
  });
};
let handle_close = (event) => {
  event.target.closest(".ms-alert").remove();
};
let handle_click = (event) => {
  if (event.target.classList.contains("ms-close")) {
    handle_close(event);
  }
};
document.addEventListener("click", handle_click);
const paypal_sdk_url = "https://www.paypal.com/sdk/js";
const client_id ="AZJDAKM4jejO_ILTqfhkqvO3LrvHnUTFkHt5S0JpkfCSteOTfAhvSD6wPkRfBmsq5ZhWsnvM6l8Avhjm";
const currency = "USD";
const intent = "capture";
let alerts = document.getElementById("alerts");

//PayPal Code
//https://developer.paypal.com/sdk/js/configuration/#link-queryparameters
url_to_head(
  paypal_sdk_url +
    "?client-id=" +
    client_id +
    "&enable-funding=venmo&currency=" +
    currency +
    "&intent=" +
    intent
)
  .then(() => {
    //Handle loading spinner
    document.getElementById("loading").classList.add("hide");
    document.getElementById("content").classList.remove("hide");
    let alerts = document.getElementById("alerts");
    let paypal_buttons = paypal.Buttons({
      // https://developer.paypal.com/sdk/js/reference
      onClick: (data) => {
        // https://developer.paypal.com/sdk/js/reference/#link-oninitonclick
      },
      style: {
        //https://developer.paypal.com/sdk/js/reference/#link-style
        shape: "rect",
        color: "gold",
        layout: "vertical",
        label: "paypal",
      },

      createOrder: function (data, actions) {
        //https://developer.paypal.com/docs/api/orders/v2/#orders_create
        return fetch("http://localhost:3000/create_order", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            intent: "CAPTURE",
            payment_source: {
              paypal: {
                name: {
                  given_name: "Arturo",
                  surname: "Hinojosa",
                },
                address: {
                  "address_line_1": "1234 Sunset Blvd",
                  "postal_code": "90210",
                  "country_code": "US",
                  "admin_area_1": "CA",
                  "admin_area_2": "Los Angeles"
                },
                email_address: "arturohin_16@outlook.com",
                phone: {
                  phone_type: "MOBILE",
                  phone_number: {
                    national_number: "(213) 555-1234",
                  },
                },
              },
            },
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: "12.89",
                },
              },
            ],
          }),
        })
          .then((response) => response.json())
          .then((order) => {
            return order.id;
          });
      },

      onApprove: function (data, actions) {
        let order_id = data.orderID;
        return fetch("http://localhost:3000/complete_order", {
          method: "post",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            intent: intent,
            order_id: order_id,
          }),
        })
          .then((response) => response.json())
          .then((order_details) => {
            let intent_object =
              intent === "authorize" ? "authorizations" : "captures";
            //Custom Successful Message
            alerts.innerHTML =
              `<div class=\'ms-alert ms-action\' style=\"background-color: #91aac0;\">
              Thank you ` +
              order_details.payer.name.given_name +
              ` ` +
              order_details.payer.name.surname +
              ` for your payment of ` +
              order_details.purchase_units[0].payments[intent_object][0].amount
                .value +
              ` ` +
              order_details.purchase_units[0].payments[intent_object][0].amount
                .currency_code +
              ` Transaction ID: ` +
              order_details.id +
              `!</div>`;

            //Close out the PayPal buttons that were rendered
            paypal_buttons.close();
          })
          .catch((error) => {
            alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small" style="background-color: #91aac0;"><span class="ms-close"></span><p>An Error Ocurred!</p>  </div>`;
          });
      },

      onCancel: function (data) {
        alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small" style="background-color: #91aac0;"><span class="ms-close"></span><p>Order cancelled!</p>  </div>`;
      },

      onError: function (err) {
        console.log(err);
      },
    });
    paypal_buttons.render("#payment_options");
  })
  .catch((error) => {
    console.error(error);
  });

let userData = {
  id: 1,
  firstName: "Arturo",
  lastName: "Hinojosa",
  email: "arturohin_16@outlook.com",
  phoneNumber: "(213) 555-1234",
  shippingAddress: {
    country: "US",
    state: "California",
    city: "Los Angeles",
    zip: "90210",
    street: "1234 Sunset Blvd",
  },
};

let userData_serialized = JSON.stringify(userData);
localStorage.setItem("userData", userData_serialized);

function test() {
  userData = {
    id: 1,
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    email: document.getElementById("email").value,
    phoneNumber: document.getElementById("phone").value,
    shippingAddress: {
      country: document.getElementById("country").value,
      state: document.getElementById("state").value,
      city: document.getElementById("city").value,
      zip: document.getElementById("postal-code").value,
      street: document.getElementById("address").value,
    },
  };
  userData_serialized = JSON.stringify(userData);
  localStorage.setItem("userData", userData_serialized);
}


