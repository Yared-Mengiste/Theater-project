$(".fo").on("click", (e) => {
  $(`#${e.target.id}`).toggleClass("active");
  console.log($(`#${e.target.id}`).attr("data-price"));
  let price = $("#price");
  let totalPrice = parseFloat(price.val());
  console.log(totalPrice);
  $(`#${e.target.id}`).hasClass("active")
    ? (totalPrice += parseFloat($(`#${e.target.id}`).attr("data-price")))
    : (totalPrice -= parseFloat($(`#${e.target.id}`).attr("data-price")));
  price.val(totalPrice);
  console.log(totalPrice);
});
$(".bookP").on("click", function (e) {
  let theater = $(".reservation-container");
  let performanceId = e.target.id;
  $("#performanceWrite").val(performanceId);
  console.log(performanceId);

  console.log(performanceId);
  theater.css({
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    "z-index": "1",
    display: "flex",
  });
  console.log("bookP clicked");
  let parentElement = $(e.target).parent();
  console.log("Parent element:", parentElement);
  let movieTitle = parentElement.find(".title").text();
  let movieType = parentElement.find(".type").text();
  let moveDuration = parentElement.find(".duration").text();
  let movieDate = parentElement.find(".date").text();
  $(".pTitle").text("Title : " + movieTitle);
  $(".pType").text(movieType);
  $(".pDuration").text(moveDuration);
  $(".pDate").text(movieDate);
  if (!(parseInt($("#userIdChecker").val()) === 0)) {
    fetch(`/setUserId?userId=${parseInt($("#userIdChecker").val())}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((error) => console.error("Error:", error));
  }
  fetch(`/getReservationsByPerformance?performanceId=${performanceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.reservations) {
        console.log("Reservations data:", data);
        userId =
          parseInt($("#userIdChecker").val()) === 0
            ? data.userId
            : parseInt($("#userIdChecker").val());
        $("#userIdChecker").val(userId);
        data.reservations.forEach((reservation) => {
          reservation.seatId.forEach((seat) => {
            if (reservation.patronId === userId) {
              $(`#${seat}`).addClass("userbooked");
              $(`#${seat}`).off("click");
            } else {
              $(`#${seat}`).addClass("booked");
              $(`#${seat}`).off("click");
            }
          });
        });
      } else {
        console.error("No reservations found");
      }
    })
    .catch((error) => console.error("Error:", error));
});
$("#cancelR").on("click", function (e) {
  let theater = $(".reservation-container");
  theater.css("display", "none");
  console.log("cancelR clicked");
  let price = $("#price");
  price.val(0);
  $("#performanceWrite").val(0.0);
  $(`.fo`).removeClass("active");
});
$("#bookR").on("click", (e) => {
  let theater = $(".reservation-container");
  let performanceId = $("#performanceWrite").val();
  console.log(performanceId);
  let selectedSeats = [];
  $(`.fo.active`).each(function () {
    selectedSeats.push($(this).attr("id"));
  });
  console.log("Selected seats:", selectedSeats);
  theater.css("display", "none");
  console.log("bookR clicked");
  let price = $("#price");
  let bPrice = price.val();
  price.val(0);
  $(`.fo`).removeClass("active");
  const queryParams = new URLSearchParams({
    performanceId: performanceId,
    selectedSeats: JSON.stringify(selectedSeats),
    price: bPrice,
  }).toString();

  fetch(`/bookReservation?${queryParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Booked reservation data:", data);
      alert("Reservation Successful Completed");
    })
    .catch((error) => console.error("Error:", error));
});
