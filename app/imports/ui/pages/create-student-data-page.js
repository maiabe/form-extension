import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/underscore';
import { StudentData, StudentDataSchema } from '../../api/studentdata/studentdata.js';

/* eslint-disable no-param-reassign */

const displaySuccessMessage = 'displaySuccessMessage';
const displayErrorMessages = 'displayErrorMessages';
const createContext = StudentDataSchema.namedContext('Create_StudentData_Page');

Tracker.autorun(function () {
  console.log('autorum', createContext.isValid(), createContext.validationErrors());
});

// The form field structures to be shared by both the create page and the edit page.
export const hobbyList = ['Surfing', 'Running', 'Biking', 'Paddling'];
export const levelList = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
export const majorList = ['Physics', 'Math', 'Chemistry', 'Computer Science'];
export const yearList = ['2017', '2018', '2019'];

export const GPAObjects = [{ label: '4.0+', value: '4' },
                           { label: '3.0-3.9', value: '3' },
                           { label: '2.0-2.9', value: '2' },
                           { label: '1.0-1.9', value: '1' }];

Template.Create_Student_Data_Page.onCreated(function onCreated() {
  this.messageFlags = new ReactiveDict();
  this.messageFlags.set(displaySuccessMessage, false);
  this.messageFlags.set(displayErrorMessages, false);
  this.context = createContext;
});

Template.Create_Student_Data_Page.helpers({
  successClass() {
    return Template.instance().messageFlags.get(displaySuccessMessage) ? 'success' : '';
  },
  displaySuccessMessage() {
    return Template.instance().messageFlags.get(displaySuccessMessage);
  },
  errorClass() {
    return Template.instance().messageFlags.get(displayErrorMessages) ? 'error' : '';
  },
  hobbies() {
    return _.map(hobbyList, function makeHobbyObject(hobby) { return { label: hobby }; });
  },
  levels() {
    return _.map(levelList, function makeLevelObject(level) { return { label: level }; });
  },
  GPAs() {
    return GPAObjects;
  },
  majors() {
    return _.map(majorList, function makeMajorObject(major) { return { label: major }; });
  },
  years() {
    return _.map(yearList, function makeYearObject(year) { return{ label: year}; });
  },
});


Template.Create_Student_Data_Page.events({
  'submit .student-data-form'(event, instance) {
    event.preventDefault();
    // Get name (text field)
    const name = event.target.Name.value;
    // Get bio (text area).
    const bio = event.target.Bio.value;
    // Get hobbies (checkboxes, zero to many)
    const hobbies = [];
    _.each(hobbyList, function setHobby(hobby) {
      if (event.target[hobby].checked) {
        hobbies.push(event.target[hobby].value);
      }
    });
    // Get level (radio buttons, exactly one)
    const level = event.target.Level.value;
    // Get GPA (single selection)
    const gpa = event.target.GPA.value;
    // Get Majors (multiple selection)
    const selectedMajors = _.filter(event.target.Majors.selectedOptions, (option) => option.selected);
    const majors = _.map(selectedMajors, (option) => option.value);

    const year = event.target.Year.value;

    const newStudentData = { name, bio, hobbies, level, gpa, majors, year };
    // Clear out any old validation errors.
    instance.context.reset();
    // Invoke clean so that newStudentData reflects what will be inserted.
    const cleanData = StudentDataSchema.clean(newStudentData);
    // Determine validity.
    instance.context.validate(cleanData);
    if (instance.context.isValid()) {
      const id = StudentData.insert(cleanData);
      instance.messageFlags.set(displaySuccessMessage, id);
      instance.messageFlags.set(displayErrorMessages, false);
      instance.find('form').reset();
      instance.$('.dropdown').dropdown('restore defaults');
    } else {
      instance.messageFlags.set(displaySuccessMessage, false);
      instance.messageFlags.set(displayErrorMessages, true);
    }
  },
});

