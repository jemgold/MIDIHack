UI.registerHelper('wrapperClass', function(currentUserActive) {
  return currentUserActive ? "wrapper wrapper--active" : "wrapper wrapper--inactive";
});

UI.registerHelper('niceDesc', function(role) {
  switch (role) {
    case "beta":
      return "bass BP filter"
      break;
    case "gamma":
      return "bass LFO"
      break;
    case "xShift":
      return "master pan"
      break;
    case "zShift":
      return "breakbeat LP filter"
      break;
    default:
      return "×"
      break;
  }
});
