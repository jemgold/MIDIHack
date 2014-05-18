UI.registerHelper('wrapperClass', function(currentUserActive) {
  return currentUserActive ? "wrapper wrapper--active" : "wrapper wrapper--inactive";
});

UI.registerHelper('niceDesc', function(role) {
  switch (role) {
    case "beta":
      return "Bass BP"
      break;
    case "gamma":
      return "Bass LFO"
      break;
    case "xShift":
      return "Pan"
      break;
    case "zShift":
      return "Drum LP"
      break;
    default:
      return "×"
      break;
  }
});
