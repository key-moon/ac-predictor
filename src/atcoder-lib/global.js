import LANG from "LANG";
import userScreenName from 'userScreenName';
//only contest page
import contestScreenName from 'typeof contestScreenName !== "undefined" ? contestScreenName : ""';
import startTime from 'typeof startTime !== "undefined" ? startTime : ""';
import endTime from 'typeof endTime !== "undefined" ? endTime : ""';

export {LANG, userScreenName, contestScreenName, startTime, endTime};