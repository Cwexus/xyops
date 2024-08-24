// Admin Page -- Tag Config

Page.Tags = class Tags extends Page.Base {
	
	onInit() {
		// called once at page load
		this.default_sub = 'list';
		this.dom_prefix = 'et';
	}
	
	onActivate(args) {
		// page activation
		if (!this.requireLogin(args)) return true;
		
		if (!args) args = {};
		if (!args.sub) args.sub = this.default_sub;
		this.args = args;
		
		app.showSidebar(true);
		
		this.loading();
		this['gosub_'+args.sub](args);
		
		return true;
	}
	
	gosub_list(args) {
		// show tag list
		app.setWindowTitle( "Tags" );
		app.setHeaderTitle( '<i class="mdi mdi-tag-multiple-outline">&nbsp;</i>Tags' );
		app.api.post( 'app/get_tags', {}, this.receive_tags.bind(this) );
	}
	
	receive_tags(resp) {
		// receive all tags from server, render them sorted
		var html = '';
		if (!resp.rows) resp.rows = [];
		if (!this.active) return; // sanity
		
		// sort by custom sort order
		this.tags = resp.rows.sort( function(a, b) {
			return a.id.localeCompare( b.id );
		} );
		
		// NOTE: Don't change these columns without also changing the responsive css column collapse rules in style.css
		var cols = ['Tag', 'ID', 'Author', 'Created', 'Modified', 'Actions'];
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'All Tags';
		html += '</div>';
		html += '<div class="box_content table">';
		
		var self = this;
		html += this.getBasicGrid( this.tags, cols, 'tag', function(item, idx) {
			var actions = [];
			actions.push( '<span class="link" onMouseUp="$P().edit_tag('+idx+')"><b>Edit</b></span>' );
			actions.push( '<span class="link" onMouseUp="$P().delete_tag('+idx+')"><b>Delete</b></span>' );
			
			return [
				'<b>' + self.getNiceTag(item, '#Tags?sub=edit&id=' + item.id) + '</b>',
				'<span class="mono">' + item.id + '</span>',
				self.getNiceUser(item.username, app.isAdmin()),
				
				'<span title="'+self.getNiceDateTimeText(item.created)+'">'+self.getNiceDate(item.created)+'</span>',
				'<span title="'+self.getNiceDateTimeText(item.modified)+'">'+self.getNiceDate(item.modified)+'</span>',
				
				actions.join(' | ')
			];
		} ); // getBasicGrid
		
		html += '</div>'; // box_content
		
		html += '<div class="box_buttons">';
			html += '<div class="button secondary" onMouseUp="$P().edit_tag(-1)"><i class="mdi mdi-tag-plus-outline">&nbsp;</i>Add Tag...</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		this.setupBoxButtonFloater();
	}
	
	edit_tag(idx) {
		// jump to edit sub
		if (idx > -1) Nav.go( '#Tags?sub=edit&id=' + this.tags[idx].id );
		else Nav.go( '#Tags?sub=new' );
	}
	
	delete_tag(idx) {
		// delete tag from search results
		this.tag = this.tags[idx];
		this.show_delete_tag_dialog();
	}
	
	gosub_new(args) {
		// create new tag
		var html = '';
		app.setWindowTitle( "New Tag" );
		
		app.setHeaderNav([
			{ icon: 'tag-multiple-outline', loc: '#Tags?sub=list', title: 'Tags' },
			{ icon: 'tag-plus-outline', title: "New Tag" }
		]);
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'Create New Tag';
			html += '<div class="box_subtitle"><a href="#Tags?sub=list">&laquo; Back to Tag List</a></div>';
		html += '</div>';
		html += '<div class="box_content">';
		
		this.tag = {
			id: "",
			title: "",
			icon: "tag-outline"
		};
		
		html += this.get_tag_edit_html();
		
		html += '</div>'; // box_content
		
		// buttons at bottom
		html += '<div class="box_buttons">';
			html += '<div class="button" onMouseUp="$P().cancel_tag_edit()">Cancel</div>';
			html += '<div class="button primary" onMouseUp="$P().do_new_tag()"><i class="mdi mdi-tag-plus-outline">&nbsp;</i>Create Tag</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		
		$('#fe_et_title').focus();
		SingleSelect.init( this.div.find('#fe_et_icon') );
		this.setupBoxButtonFloater();
	}
	
	cancel_tag_edit() {
		// cancel editing tag and return to list
		Nav.go( '#Tags?sub=list' );
	}
	
	do_new_tag(force) {
		// create new tag
		app.clearError();
		var tag = this.get_tag_form_json();
		if (!tag) return; // error
		
		this.tag = tag;
		
		Dialog.showProgress( 1.0, "Creating Tag..." );
		app.api.post( 'app/create_tag', tag, this.new_tag_finish.bind(this) );
	}
	
	new_tag_finish(resp) {
		// new tag created successfully
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go('Tags?sub=list');
		app.showMessage('success', "The new tag was created successfully.");
	}
	
	gosub_edit(args) {
		// edit tag subpage
		this.loading();
		app.api.post( 'app/get_tag', { id: args.id }, this.receive_tag.bind(this), this.fullPageError.bind(this) );
	}
	
	receive_tag(resp) {
		// edit existing tag
		var html = '';
		this.tag = resp.tag;
		if (!this.active) return; // sanity
		
		app.setWindowTitle( "Editing Tag \"" + (this.tag.title) + "\"" );
		
		app.setHeaderNav([
			{ icon: 'tag-multiple-outline', loc: '#Tags?sub=list', title: 'Tags' },
			{ icon: this.tag.icon || 'tag-outline', title: this.tag.title }
		]);
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'Edit Tag Details';
			html += '<div class="box_subtitle"><a href="#Tags?sub=list">&laquo; Back to Tag List</a></div>';
		html += '</div>';
		html += '<div class="box_content">';
		
		html += this.get_tag_edit_html();
		
		html += '</div>'; // box_content
		
		// buttons at bottom
		html += '<div class="box_buttons">';
			html += '<div class="button" onMouseUp="$P().cancel_tag_edit()">Cancel</div>';
			html += '<div class="button danger" onMouseUp="$P().show_delete_tag_dialog()">Delete Tag...</div>';
			html += '<div class="button primary" onMouseUp="$P().do_save_tag()"><i class="mdi mdi-floppy">&nbsp;</i>Save Changes</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		
		// lock ID for editing
		$('#fe_et_id').attr('disabled', true);
		SingleSelect.init( this.div.find('#fe_et_icon') );
		this.setupBoxButtonFloater();
	}
	
	do_save_tag() {
		// save changes to tag
		app.clearError();
		var tag = this.get_tag_form_json();
		if (!tag) return; // error
		
		this.tag = tag;
		
		Dialog.showProgress( 1.0, "Saving Tag..." );
		app.api.post( 'app/update_tag', tag, this.save_tag_finish.bind(this) );
	}
	
	save_tag_finish(resp, tx) {
		// new tag saved successfully
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go( 'Tags?sub=list' );
		app.showMessage('success', "The tag was saved successfully.");
	}
	
	show_delete_tag_dialog() {
		// show dialog confirming tag delete action
		var self = this;
		
		Dialog.confirmDanger( 'Delete Tag', "Are you sure you want to <b>permanently delete</b> the tag &ldquo;" + this.tag.title + "&rdquo;?  There is no way to undo this action.", 'Delete', function(result) {
			if (result) {
				Dialog.showProgress( 1.0, "Deleting Tag..." );
				app.api.post( 'app/delete_tag', self.tag, self.delete_tag_finish.bind(self) );
			}
		} );
	}
	
	delete_tag_finish(resp, tx) {
		// finished deleting tag
		var self = this;
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go('Tags?sub=list', 'force');
		app.showMessage('success', "The tag &ldquo;" + this.tag.title + "&rdquo; was deleted successfully.");
	}
	
	get_tag_edit_html() {
		// get html for editing an tag (or creating a new one)
		var html = '';
		var tag = this.tag;
		
		// title
		html += this.getFormRow({
			label: 'Tag Title:',
			content: this.getFormText({
				id: 'fe_et_title',
				spellcheck: 'false',
				value: tag.title,
				onChange: '$P().suggestIDFromTitle()'
			}),
			caption: 'Enter the title (label) for the tag, for display purposes.'
		});
		
		// tag id
		html += this.getFormRow({
			label: 'Tag ID:',
			content: this.getFormText({
				id: 'fe_et_id',
				class: 'monospace',
				spellcheck: 'false',
				onChange: '$P().checkTagExists(this)',
				value: tag.id
			}),
			suffix: '<div class="checker"></div>',
			caption: 'Enter a unique ID for the tag (alphanumerics only).  Once created this cannot be changed.'
		});
		
		html += this.getFormRow({
			label: 'Icon:',
			content: this.getFormMenuSingle({
				id: 'fe_et_icon',
				title: 'Select icon for tag',
				placeholder: 'Select icon for tag...',
				options: [['', '(None)']].concat( iconFontNames.map( function(name) { return { id: name, title: name, icon: name }; } ) ),
				value: tag.icon || '',
				// 'data-shrinkwrap': 1
			}),
			caption: 'Optionally choose an icon for the tag.'
		});
		
		// notes
		html += this.getFormRow({
			label: 'Description:',
			content: this.getFormTextarea({
				id: 'fe_et_notes',
				rows: 5,
				value: tag.notes
			}),
			caption: 'Optionally enter a description, for internal use.'
		});
		
		return html;
	}
	
	get_tag_form_json() {
		// get api key elements from form, used for new or edit
		var tag = this.tag;
		
		tag.id = $('#fe_et_id').val().trim().replace(/\W+/g, '_').toLowerCase();
		tag.title = $('#fe_et_title').val().trim();
		tag.icon = $('#fe_et_icon').val().replace(/^mdi\-/, '');
		tag.notes = $('#fe_et_notes').val();
		
		if (!tag.id.length) {
			return app.badField('#fe_et_id', "Please enter a unique alphanumeric ID for the tag.");
		}
		if (!tag.title.length) {
			return app.badField('#fe_et_title', "Please enter a title for the tag.");
		}
		
		return tag;
	}
	
	updateIcon(field) {
		// render icon next to text field
		var $field = $(field);
		var icon = trim( $field.val().toLowerCase() ).replace(/^mdi\-/, '');
		var $elem = $field.closest('.form_row').find('.fr_suffix .checker');
		$elem.html('<span class="mdi mdi-' + icon + '"></span>');
		
		if (icon != $field.val()) $field.val(icon);
	}
	
	checkTagExists(field) {
		// check if tag exists, update UI checkbox
		// called after field changes
		var $field = $(field);
		var id = $field.val().trim().replace(/\W+/g, '_').toLowerCase();
		var $elem = $field.closest('.form_row').find('.fr_suffix .checker');
		
		if (id != $field.val()) $field.val(id);
		
		if (id.match(/^\w+$/)) {
			// check with cache
			if (find_object(app.tags, { id: id })) {
				// tag taken
				$elem.css('color','red').html('<span class="mdi mdi-alert-circle"></span>').attr('title', "Tag ID is taken.");
				$field.addClass('warning');
			}
			else {
				// tag is valid and available!
				$elem.css('color','green').html('<span class="mdi mdi-check-circle"></span>').attr('title', "Tag ID is available!");
				$field.removeClass('warning');
			}
		}
		else if (id.length) {
			// bad id
			$elem.css('color','red').html('<span class="mdi mdi-alert-decagram"></span>').attr('title', "Tag ID is malformed.");
			$field.addClass('warning');
		}
		else {
			// empty
			$elem.html('').removeAttr('title');
			$field.removeClass('warning');
		}
	}
	
	onDataUpdate(key, data) {
		// refresh list if tags were updated
		if ((key == 'tags') && (this.args.sub == 'list')) this.gosub_list(this.args);
	}
	
	onDeactivate() {
		// called when page is deactivated
		this.div.html( '' );
		return true;
	}
	
};
