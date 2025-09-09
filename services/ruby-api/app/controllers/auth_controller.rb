class AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:login, :register]

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      render json: { token: user.generate_jwt, user: user.as_json(except: :password_digest) }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def register
    user = User.new(user_params)
    if user.save
      render json: { token: user.generate_jwt, user: user.as_json(except: :password_digest) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :username, :password, :password_confirmation)
  end
end

class ReadingHistoryController < ApplicationController
  def index
    histories = current_user.reading_histories
      .includes(:manga, :chapter)
      .order(updated_at: :desc)
    
    render json: histories
  end

  def create
    history = current_user.reading_histories.find_or_initialize_by(
      manga_id: params[:manga_id],
      chapter_id: params[:chapter_id]
    )
    
    if history.save
      render json: history, status: :created
    else
      render json: { errors: history.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

class BookmarksController < ApplicationController
  def index
    bookmarks = current_user.bookmarks.includes(:manga)
    render json: bookmarks
  end

  def create
    bookmark = current_user.bookmarks.build(manga_id: params[:manga_id])
    if bookmark.save
      render json: bookmark, status: :created
    else
      render json: { errors: bookmark.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    bookmark = current_user.bookmarks.find(params[:id])
    bookmark.destroy
    head :no_content
  end
end

class CommentsController < ApplicationController
  def index
    comments = Comment.where(manga_id: params[:manga_id])
      .includes(:user)
      .order(created_at: :desc)
    
    render json: comments
  end

  def create
    comment = current_user.comments.build(comment_params)
    if comment.save
      render json: comment, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def comment_params
    params.require(:comment).permit(:content, :manga_id)
  end
end

class RatingsController < ApplicationController
  def create
    rating = current_user.ratings.find_or_initialize_by(manga_id: params[:manga_id])
    rating.score = params[:score]
    
    if rating.save
      # Update manga average rating
      manga = rating.manga
      manga.update_average_rating
      
      render json: { rating: rating, average: manga.average_rating }
    else
      render json: { errors: rating.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
