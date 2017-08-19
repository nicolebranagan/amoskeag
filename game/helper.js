function listString(list, begin, end, begin_pl, end_pl) {
  if (list.length == 0)
    return "";
  let output = "";
  if (begin == "")
    list[0] = list[0].charAt(0).toUpperCase() + list[0].slice(1);
  if (list.length !== 1) {
    for (i = 0; i < list.length - 1; i ++)
      list[i] = list[i] + ", "
    list[list.length - 1] = "and " + list[list.length - 1];
    begin = begin_pl;
    end = end_pl;
  }
  return "\n\n" + begin + list.join("") + end;
}

exports.npcString = (list) => listString(list, "", " is here", "", " are here");