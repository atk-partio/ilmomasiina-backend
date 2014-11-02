require 'spec_helper'

describe Api::EventsController, :type => :controller do

  describe "GET #index" do
    let(:events) do
      [
        build(:event, name: "Event 1"),
        build(:event, name: "Event 2"),
        build(:event, name: "Event 3"),
      ]
    end

    let(:fake_event_model) { double("Event", all: events) }

    before do
      # Mock the default Event class completely away and use our spy double
      # instead.
      stub_const("Event", fake_event_model)

      ## The other way would be to just mock the class method Event.all away and
      ## make it return our custom events, like the way below
      # expect(Event).to receive(:all).and_return(events)

      # Fire off the request
      get :index
    end

    it { is_expected.to respond_with :success }

    it "retrieves all events" do
      expect(fake_event_model).to have_received(:all).with(no_args)
    end

    it "has a correct json content type header" do
      expect(response.content_type).to eq("application/json")
    end

    describe "body" do
      subject(:output) { response.body }

      it "is valid JSON" do
        expect{ JSON.parse(output) }.not_to raise_error
      end

      it "contains all events" do
        expect(output).to be_json_eql(events.to_json)
      end
    end
  end

  describe "POST #create" do
    let(:create_new_event) { instance_double("CreateNewEvent") }
    let(:attributes) { attributes_for(:event) }
    let(:event) { build_stubbed(:event, attributes) }

    it "calls CreateNewEvent service" do
      expect(CreateNewEvent).to receive(:call) { event }
      post :create, event: attributes
    end

    it do
      is_expected.to permit(
        :name,
        :description,
        :date,
        :registration_begins_at,
        :registration_ends_at
      ).for(:create)
    end

    context "on successful save" do
      before do
        allow(CreateNewEvent).to receive(:new) { create_new_event }
        allow(create_new_event).to receive(:call) { event }

        post :create, event: attributes
      end

      it "responds with status 201 Created" do
        expect(response.status).to eq(201)
      end
    end

    context "on unsuccessful save" do
      let(:create_new_event) { instance_double("CreateNewEvent") }
      let(:event) { Event.new }

      before do
        allow(CreateNewEvent).to receive(:new) { create_new_event }
        allow(create_new_event).to receive(:call) { event }

        post :create, event: attributes
      end

      it "responds with status 400 Bad Request" do
        expect(response.status).to eq(400)
      end
    end
  end
end
