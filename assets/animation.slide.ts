import {
  trigger,
  state,
  style,
  transition,
  animate,
  group,
} from "@angular/animations";

export const SlideLeftInOutAnimation = [
  trigger("slideLeftInOut", [
    state(
      "in",
      style({
        "margin-left": "0px",
        visibility: "visible",
      })
    ),
    state(
      "out",
      style({
        "margin-left": "100%",
        visibility: "hidden",
      })
    ),
    transition("in => out", [
      group([
        animate(
          "200ms ease-in-out",
          style({
            "margin-right": "100%",
          })
        ),
        animate(
          "500ms ease-in-out",
          style({
            visibility: "hidden",
          })
        ),
      ]),
    ]),
    transition("out => in", [
      group([
        animate(
          "1ms ease-in-out",
          style({
            visibility: "visible",
          })
        ),
        animate(
          "400ms ease-in-out",
          style({
            "margin-left": "0px",
          })
        ),
      ]),
    ]),
  ]),
];
