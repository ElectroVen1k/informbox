const template = $('#template-column');
const table = $('.table');
const tableBody = $('.table tbody');
const row = $('#template-column').contents('.table__row');
const buttons = $('.table__column--top input');
let hiddenRow = [];

const setName = (parent, name) => {
  const newName = name[0].toUpperCase() + name.substring(1);
  parent.children('[data-name]').html(newName);
};

$(document).ready(function(){
  $.ajax({
    url: 'https://reqres.in/api/unknown?per_page=12',
    dataType : "json",
    success: function (data, textStatus) {
      $.each(data, function(i, val) {
          if (i === 'data') {
            $.each(val, function(elem, obj) {
              const newRow = row.clone()
              newRow.children('[data-id]').html(obj.id);
              setName(newRow, obj.name);
              newRow.children('[data-year]').html(obj.year);
              newRow.children('[data-color]').children('[data-color-text]').html(obj.color);
              newRow.children('[data-color]').children('[data-color-rect]').css('backgroundColor', obj.color);
              newRow.children('[data-value]').html(obj.pantone_value);
              tableBody.append(newRow);
            });
          }
      });
    }
  });
});

$.each(buttons, function (i, button) {
  button.addEventListener('click', function() {
    const parent = button.closest('.table__column')
    const rowName = parent.getAttribute('data-row');
    table.addClass(`hidden-${rowName}`);
    hiddenRow.push(`hidden-${rowName}`);
    $('.content__reset').attr('disabled', false);
  })
})

$('.content__reset').on('click', function() {
  console.log("нажал")
  for(let i = hiddenRow.length; i >= 0; i--) {
    table.removeClass(hiddenRow[i])
  }
  hiddenRow = [];
  $('.content__form').trigger('reset');
  $('.content__reset').attr('disabled', true);
});
