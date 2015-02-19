Template.employees_form.rendered = function() {
    $('#birthDate').datepicker();
};

Template.employees_form.helpers({
    /* show error message on view */
    error: function(field) {
        return MeteorisSimpleSchema.error(Employees, field);
    },
    /* get current selected dropdown */
    selected: function(_id) {
        if (this._id === _id)
            return "selected";
    },
    jobs: function() {
        return Jobs.find({});
    },

});